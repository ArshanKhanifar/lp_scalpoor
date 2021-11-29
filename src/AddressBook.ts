import { globalContext, Network, RPCAddressBook } from "./Network";
import { ethers } from "ethers";
import { NetworkAddressBookType } from "./GenericTypes";

export enum ContractId {
  MIM,
  SDOG,
  MIM_SDOG,
  JOE_ROUTER,
  WAVAX,
  AROME,
  FRAX,
  AROME_FRAX,
  WETH,
  BEAN,
  WETH_BEAN,
  USDC,
  WETH_USDC,
  SPOOKY_ROUTER,
  WFTM,
  WFTM_MIM,
  WFTM_ETH,
}

const NetworkAddressBook: NetworkAddressBookType = {
  [Network.ETHEREUM]: {
    [ContractId.BEAN]: "0xdc59ac4fefa32293a95889dc396682858d52e5db",
    [ContractId.WETH]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    [ContractId.WETH_BEAN]: "0x87898263b6c5babe34b4ec53f22d98430b91e371",
    [ContractId.USDC]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    [ContractId.WETH_USDC]: "0x397ff1542f962076d0bfe58ea045ffa2d347aca0",
  },
  [Network.MOONRIVER]: {
    [ContractId.AROME]: "0x3D2D044E8C6dAd46b4F7896418d3d4DFaAD902bE",
    [ContractId.FRAX]: "0x1A93B23281CC1CDE4C4741353F3064709A16197d",
    [ContractId.AROME_FRAX]: "0xcf06cFB361615C49403B45a5E56E3B7da3462EEA",
  },
  [Network.FANTOM]: {
    [ContractId.WETH]: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    [ContractId.WFTM]: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    [ContractId.WFTM_MIM]: "0x6f86e65b255c9111109d2d2325ca2dfc82456efc",
    [ContractId.MIM]: "0x82f0B8B456c1A451378467398982d4834b6829c1",
    [ContractId.SPOOKY_ROUTER]: "0xF491e7B69E4244ad4002BC14e878a34207E38c29",
    [ContractId.WFTM_ETH]: "0xf0702249f4d3a25cd3ded7859a165693685ab577",
  },
  [Network.AVAX]: {
    [ContractId.MIM]: "0x130966628846bfd36ff31a822705796e8cb8c18d",
    [ContractId.SDOG]: "0xde9e52f1838951e4d2bb6c59723b003c353979b6",
    [ContractId.MIM_SDOG]: "0xa3F1F5076499EC37D5BB095551f85ab5a344BB58",
    [ContractId.JOE_ROUTER]: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    [ContractId.WAVAX]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  },
};

const getAddressBook = () => {
  return NetworkAddressBook[globalContext.network];
};

export const getAddress = (id: ContractId) => {
  return getAddressBook()[id];
};

export const web3Provider = () =>
  new ethers.providers.JsonRpcProvider(RPCAddressBook[globalContext.network]);
