import { ContractId } from "../AddressBook";
import { PriceCallback, watchPrice } from "../PriceWatchoor";
import { getWethPrice } from "../EthPriceUtility";
import { Fsm } from "../Fsm";
import { loadToken } from "../Erc20Utilities";
import { getProvider, getSelfAddress } from "../Config";
import { etherscanUrl, swapUni } from "../Swapper";
import { postMessageToTelegram } from "../TelegramSendoor";

const watchBeanPrice = async (callback: PriceCallback) => {
  await watchPrice(
    ContractId.WETH_BEAN,
    ContractId.WETH,
    async (beanPerEth) => {
      const ethPrice = await getWethPrice();
      const beanPrice = beanPerEth * ethPrice;
      console.log("bean price: ", beanPrice);
      callback(beanPrice);
    }
  );
};

const GAS_PERCENTAGE = 10;
const SLIPPAGE = 0.005;

enum States {
  BUY_BEANS,
  SELL_BEANS,
}

export const getBalance = async (coin: ContractId): Promise<number> => {
  const token = await loadToken(coin);
  const balanceBn = await token.contract.balanceOf(getSelfAddress());
  return token.fromBigNumber(balanceBn);
};

const getBeanBalance = () => getBalance(ContractId.BEAN);
const getUsdcBalance = () => getBalance(ContractId.USDC);

const _swap = async (
  token1: ContractId,
  amount1: number,
  token2: ContractId,
  amount2Min: number
) => {
  const gasPrice = await getProvider().getGasPrice();
  const ourPrice = gasPrice.mul(100 + GAS_PERCENTAGE).div(100);
  return swapUni(token1, amount1, token2, amount2Min, {
    gasPrice: ourPrice,
  });
};

export const scalpBeans = async () => {
  const fsm = new Fsm(States.SELL_BEANS);

  fsm.addState(States.SELL_BEANS, async (beanPrice) => {
    const beans = await getBeanBalance();
    try {
      const tx = await _swap(
        ContractId.BEAN,
        beans,
        ContractId.USDC,
        beans * beanPrice * (1 - SLIPPAGE)
      );
      await postMessageToTelegram(`sold ${beans} beans: ${etherscanUrl(tx)}`);
    } catch (e) {
      await postMessageToTelegram(`error selling beans: ${e}`);
    }
  });

  fsm.addState(States.BUY_BEANS, async (beanPrice) => {
    const usdc = await getUsdcBalance();
    try {
      const tx = await _swap(
        ContractId.USDC,
        usdc,
        ContractId.BEAN,
        (usdc / beanPrice) * (1 - SLIPPAGE)
      );
      await postMessageToTelegram(
        `bought $${usdc} worth of beans: ${etherscanUrl(tx)}`
      );
    } catch (e) {
      await postMessageToTelegram(`error buying beans: ${e}`);
    }
  });

  fsm.addTransition(
    States.BUY_BEANS,
    States.SELL_BEANS,
    (price: number) => price > 1.075
  );

  fsm.addTransition(
    States.SELL_BEANS,
    States.BUY_BEANS,
    (price: number) => price < 1.01
  );

  watchBeanPrice((beanPrice) => {
    fsm.process(beanPrice);
  });
};
