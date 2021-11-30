import { globalContext, Network, RPCAddressBook, setNetwork } from "./Network";
import { ethers, Wallet } from "ethers";

export const setup = () => {
  setNetwork(Network.ETHEREUM);
};

export const getProvider = () =>
  ethers.getDefaultProvider(RPCAddressBook[globalContext.network]);

export const getSigner = () => {
  const { PRIVATE_KEY } = process.env;
  if (!PRIVATE_KEY) {
    throw Error("No private key found");
  }
  return new Wallet(PRIVATE_KEY, getProvider());
};

export const getSelfAddress = () => getSigner().address;
