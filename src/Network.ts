import { AddressBookType } from "./GenericTypes";

export enum Network {
  ETHEREUM,
  AVAX,
  FANTOM,
  POLYGON,
  MOONRIVER,
}

export type GlobalContext = {
  network: Network;
};

export const globalContext: GlobalContext = {
  network: Network.ETHEREUM,
};

export const setNetwork = (network: Network) => {
  globalContext.network = network;
};

export const RPCAddressBook: AddressBookType = {
  [Network.AVAX]: "https://api.avax.network/ext/bc/C/rpc",
  [Network.MOONRIVER]: "https://rpc.moonriver.moonbeam.network",
  [Network.FANTOM]: "https://rpc.ftm.tools",
};
