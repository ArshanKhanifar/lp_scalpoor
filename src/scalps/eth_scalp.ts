import {watchPrice} from "../PriceWatchoor";
import {ContractId} from "../AddressBook";
import {getRelativePrice} from "../Utilities";
import {swap} from "../Swapper";

/*
const fsm = new Fsm(defaultState);
fsm.addState(state, stateFn);
fsm.addTransition(from:state1, to: state2, guard())
fsm.addTransition(from:state2, to: state1, guard())
fsm.process(price);
 */

export const scalpEth = () => {
  enum STATE {
    BUY,
    SELL,
  }
  let state = STATE.BUY;

  watchPrice(ContractId.WFTM_ETH, ContractId.WETH, async (price) => {
    const ftmPerMim = await getRelativePrice(
      ContractId.WFTM_MIM,
      ContractId.WFTM
    );

    const ethPrice = price * ftmPerMim;
  });
};
