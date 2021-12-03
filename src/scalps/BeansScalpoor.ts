import { ContractId } from "../AddressBook";
import { PriceCallback, watchPrice } from "../PriceWatchoor";
import { getWethPrice } from "../EthPriceUtility";
import { Fsm } from "../Fsm";
import { loadToken } from "../Erc20Utilities";
import { getProvider, getSelfAddress } from "../Config";
import { etherscanUrl, swapUni } from "../Swapper";
import { postMessageToTelegram } from "../TelegramSendoor";
import { getRelativePrice } from "../Utilities";

export const getBeanPrice = async () => {
  const beanPerWeth = await getRelativePrice(
    ContractId.WETH_BEAN,
    ContractId.BEAN
  );
  const usdPerWeth = await getWethPrice();
  const beanPerUsd = beanPerWeth * usdPerWeth;
  return beanPerUsd;
};

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

const GAS_PERCENTAGE = 30;
const SLIPPAGE = 0.02;
const LIQ_PROVIDER = 0.994;

export enum States {
  BUY_BEANS,
  SELL_BEANS,
}

export const getBalance = async (coin: ContractId): Promise<number> => {
  const token = await loadToken(coin);
  const balanceBn = await token.contract.balanceOf(getSelfAddress());
  return token.fromBigNumber(balanceBn);
};

export const getBeanBalance = () => getBalance(ContractId.BEAN);
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
    gasLimit: 300000,
    gasPrice: ourPrice,
  });
};

export const sellBeans = async (beanPrice: number, amount: number = 0) => {
  const beans = (amount === 0 ? await getBeanBalance() : amount) * LIQ_PROVIDER;
  const usd = beans * beanPrice * (1 - SLIPPAGE);
  try {
    const tx = await _swap(ContractId.BEAN, beans, ContractId.USDC, usd);
    await postMessageToTelegram(`sold ${beans} beans: ${etherscanUrl(tx)}`);
  } catch (e) {
    console.error(e);
    await postMessageToTelegram(`error selling beans: ${e}`);
  }
};

export const buyBeans = async (beanPrice: number, amount: number = 0) => {
  const usdc = (amount === 0 ? await getUsdcBalance() : amount) * LIQ_PROVIDER;
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
    console.error(e);
    await postMessageToTelegram(`error buying beans: ${e}`);
  }
};

export const scalpBeans = async () => {
  const beanBalance = await getBeanBalance();
  const usdcBalance = await getUsdcBalance();
  const initialState =
    beanBalance > usdcBalance ? States.BUY_BEANS : States.SELL_BEANS;
  console.log(
    "Starting in the state: ",
    initialState === States.BUY_BEANS ? "Buy" : "Sell"
  );

  const fsm = new Fsm(initialState);
  const [HIGH_PRICE, LOW_PRICE] = [1.03, 0.96];

  fsm.addState(States.SELL_BEANS, async (beanPrice) => {
    await sellBeans(beanPrice);
  });

  fsm.addState(States.BUY_BEANS, async (beanPrice) => {
    await buyBeans(beanPrice);
  });

  fsm.addTransition(
    States.BUY_BEANS,
    States.SELL_BEANS,
    (price: number) => price > HIGH_PRICE
  );

  fsm.addTransition(
    States.SELL_BEANS,
    States.BUY_BEANS,
    (price: number) => price < LOW_PRICE
  );

  watchBeanPrice((beanPrice) => {
    fsm.process(beanPrice);
  });
};
