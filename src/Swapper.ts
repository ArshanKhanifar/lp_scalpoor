import { ContractId } from "./AddressBook";
import { getRouterContract } from "./Utilities";
import { loadToken } from "./Erc20Utilities";
import { getSelfAddress } from "./Config";

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

export const swap = async (
  routerAddress: ContractId,
  token1Id: ContractId,
  amount1: number,
  token2Id: ContractId,
  amount2Min: number,
  baseTokenId: ContractId
) => {
  const router = getRouterContract(routerAddress);
  const deadline = Date.now() + 60 * 60 * 1e3;
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
    deadline
  );
  console.log(`tx: ${tx.hash}`);
  await tx.wait();
  console.log(`done`);
};
