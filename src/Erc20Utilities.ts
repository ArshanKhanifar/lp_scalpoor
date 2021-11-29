import { ContractId, getAddress } from "./AddressBook";
import { getErcContract, pow } from "./Utilities";
import { BigNumber } from "ethers";
import { ContractIsh, Lookup } from "./GenericTypes";

export class ERC20Token {
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  constructor({
    address,
    symbol,
    name,
    decimals,
  }: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  }) {
    this.address = address;
    this.name = name;
    this.decimals = decimals;
    this.symbol = symbol;
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
    return (
      amountBn.div(pow(rest)).toNumber() / Math.pow(10, significantDigits)
    );
  }
}

let loadedTokens: Lookup<ERC20Token> = {};

export const loadToken = async (id: ContractIsh): Promise<ERC20Token> => {
  const address = typeof id === "string" ? id : getAddress(id);
  if (loadedTokens[address]) {
    return loadedTokens[address];
  }
  const erc20Contract = getErcContract(id);
  const name = await erc20Contract.name();
  const symbol = await erc20Contract.symbol();
  const decimals = await erc20Contract.decimals();
  const token = new ERC20Token({ address, name, symbol, decimals });
  loadedTokens[address] = token;
  return token;
};
