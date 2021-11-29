import { ContractId, getAddress } from "./AddressBook";
import { UniswapV2Router } from "./abi/UniswapV2Router";
import { Erc20ABI } from "./abi/ERC20";
import { UniswapV2Pair } from "./abi/UniswapV2Pair";
import { Contract } from "ethers";
import { ContractIsh } from "./GenericTypes";
import { getProvider, getSigner } from "./Config";
import { loadToken } from "./Erc20Utilities";

export const getReadOnlyContract = (id: ContractIsh, abi: any) => {
  const address = typeof id === "string" ? id : getAddress(id);
  const provider = getProvider();
  return new Contract(address, abi, provider);
};

export const getPairContract = (id: ContractIsh) =>
  getReadOnlyContract(id, UniswapV2Pair);

export const getRelativePrice = async (pair: ContractId, main: ContractId) => {
  const pairContract = getPairContract(pair);
  const firstAddress = await pairContract.token0();
  const secondAddress = await pairContract.token1();
  const [firstReserve, secondReserve] = await pairContract.getReserves();
  const mainToken = await loadToken(main);
  const firstToken = await loadToken(firstAddress);
  const secondToken = await loadToken(secondAddress);
  const perToken =
    mainToken.address === firstAddress ? secondToken : firstToken;
  const mainReserve = mainToken.fromBigNumber(
    mainToken.address === firstAddress ? firstReserve : secondReserve
  );
  const perReserve = perToken.fromBigNumber(
    mainToken.address === firstAddress ? secondReserve : firstReserve
  );
  return perReserve / mainReserve;
};

export const pow = (n: number) => `1${"0".repeat(n)}`;

export const getContract = (id: ContractIsh, abi: any) => {
  const address = typeof id === "string" ? id : getAddress(id);
  const signer = getSigner();
  return new Contract(address, abi, signer);
};

export const getRouterContract = (id: ContractIsh) =>
  getContract(id, UniswapV2Router);

export const getErcContract = (id: ContractIsh) =>
  getReadOnlyContract(id, Erc20ABI);
