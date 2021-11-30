import { ContractId, getAddress } from "./AddressBook";
import { getErcContract, pow } from "./Utilities";
import { BigNumber, Contract } from "ethers";
import { ContractIsh, Lookup } from "./GenericTypes";

export class ERC20Token {
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  contract: Contract;
  constructor({
    address,
    symbol,
    name,
    decimals,
    contract,
  }: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    contract: Contract;
  }) {
    this.address = address;
    this.name = name;
    this.decimals = decimals;
    this.symbol = symbol;
    this.contract = contract;
  }

  toBigNumber(amount: number) {
    let i = 1;
    while (amount * i < 1e9) {
      i *= 10;
    }
    return BigNumber.from(pow(this.decimals))
      .mul(Math.ceil(amount * i))
      .div(i);
  }

  fromBigNumber(amountBn: BigNumber) {
    const significantDigits = 6;
    const rest = this.decimals - significantDigits;
    return amountBn.div(pow(rest)).toNumber() / Math.pow(10, significantDigits);
  }
}

let loadedTokens: Lookup<ERC20Token> = {};

export const loadToken = async (id: ContractIsh): Promise<ERC20Token> => {
  const address = typeof id === "string" ? id : getAddress(id);
  if (loadedTokens[address]) {
    return loadedTokens[address];
  }
  const contract = getErcContract(id);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const token = new ERC20Token({ address, name, symbol, decimals, contract });
  loadedTokens[address] = token;
  return token;
};
