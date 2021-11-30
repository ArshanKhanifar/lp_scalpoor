import { ContractId } from "./AddressBook";
import { getRouterContract } from "./Utilities";
import { loadToken } from "./Erc20Utilities";
import { getSelfAddress } from "./Config";
import { Overrides } from "ethers";

export const swapSpooky = async (
  token1: ContractId,
  amount1: number,
  token2: ContractId,
  amount2Min: number
) =>
  swap(
    ContractId.SPOOKY_ROUTER,
    token1,
    amount1,
    token2,
    amount2Min,
    ContractId.WFTM
  );

export const etherscanUrl = (tx: string) => `https://etherscan.io/tx/${tx}`;

export const swapUni = async (
  token1: ContractId,
  amount1: number,
  token2: ContractId,
  amount2Min: number,
  overrides?: Overrides
) =>
  swap(
    ContractId.UNI_ROUTER,
    token1,
    amount1,
    token2,
    amount2Min,
    ContractId.WETH,
    overrides
  );

export const swap = async (
  routerAddress: ContractId,
  token1Id: ContractId,
  amount1: number,
  token2Id: ContractId,
  amount2Min: number,
  baseTokenId: ContractId,
  overrides?: Overrides
) => {
  const router = getRouterContract(routerAddress);
  const deadline = Date.now() + 60 * 60 * 1e3; // hour
  const token1 = await loadToken(token1Id);
  const token2 = await loadToken(token2Id);
  const baseToken = await loadToken(baseTokenId);
  console.log(
    `Swap: ${amount1} ${token1.symbol} -> ${amount2Min} ${token2.symbol}`
  );
  const tx = await router.swapExactTokensForTokens(
    token1.toBigNumber(amount1),
    token2.toBigNumber(amount2Min),
    [token1.address, baseToken.address, token2.address],
    getSelfAddress(),
    deadline,
    overrides
  );
  console.log(etherscanUrl(tx.hash));
  await tx.wait();
  console.log(`done`);
  return tx.hash;
};
