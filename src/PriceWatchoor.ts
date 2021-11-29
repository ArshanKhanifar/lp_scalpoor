import { ContractId } from "./AddressBook";
import { BigNumber } from "ethers";
import { getErcContract, getPairContract } from "./Utilities";
import { ContractIsh } from "./GenericTypes";
import { loadToken } from "./Erc20Utilities";

export type PriceCallback = (price: number) => void;

export const watchPrice = async (
  id: ContractId,
  main: ContractIsh,
  callback: PriceCallback = () => null
) => {
  const lp = getPairContract(id);
  const token0Addr = await lp.token0();
  const token1Addr = await lp.token1();
  const token0 = await loadToken(token0Addr);
  const token1 = await loadToken(token1Addr);
  const mainToken = await loadToken(main);

  console.log(`watching the ${token0.name}/${token1.name} pair`);

  lp.on(
    "Swap",
    (
      addr,
      in0: BigNumber,
      in1: BigNumber,
      out0: BigNumber,
      out1: BigNumber
    ) => {
      const first = in0.isZero()
        ? token0.fromBigNumber(out0)
        : token0.fromBigNumber(in0);
      const second = in0.isZero()
        ? token1.fromBigNumber(in1)
        : token1.fromBigNumber(out1);
      const price =
        mainToken.address === token0.address ? second / first : first / second;

      if (in0.isZero()) {
        console.log(`${second} ${token1.symbol} => ${first} ${token0.symbol}`);
      } else {
        console.log(`${first} ${token0.symbol} => ${second} ${token1.symbol}`);
      }

      console.log("price", price);
      callback(price);
    }
  );
};
