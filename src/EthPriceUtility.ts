import { getRelativePrice } from "./Utilities";
import { ContractId } from "./AddressBook";

export const getEthFantom = async () => {
  const ftmPerMim = await getRelativePrice(
    ContractId.WFTM_MIM,
    ContractId.WFTM
  );
  const ethPerFtm = await getRelativePrice(
    ContractId.WFTM_ETH,
    ContractId.WETH
  );
  return ftmPerMim * ethPerFtm;
};

export const getWethPrice = async () =>
  getRelativePrice(ContractId.WETH_USDC, ContractId.WETH);
