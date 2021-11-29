import { Fsm } from "../src/Fsm";

describe("FSM", () => {
  enum States {
    STATE_BUY,
    STATE_SELL,
  }

  let fsm: Fsm<States>;
  let buyFn: ReturnType<typeof jest.fn>, sellFn: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    buyFn = jest.fn();
    sellFn = jest.fn();

    fsm = new Fsm<States>(States.STATE_BUY);
    fsm.addState(States.STATE_BUY, buyFn);
    fsm.addState(States.STATE_SELL, sellFn);
    fsm.addTransition(
      States.STATE_BUY,
      States.STATE_SELL,
      (price: number) => price > 120
    );
    fsm.addTransition(
      States.STATE_SELL,
      States.STATE_BUY,
      (price: number) => price < 100
    );
  });

  test("should not have called stuff by default", () => {
    expect(buyFn).not.toHaveBeenCalled();
    expect(sellFn).not.toHaveBeenCalled();
  });

  describe("buy -> sell", () => {
    beforeEach(() => {
      fsm.process(100);
      expect(sellFn).not.toHaveBeenCalled();
      fsm.process(130);
      expect(sellFn).toHaveBeenCalledTimes(1);
    });

    test("should not re-enter sell", () => {
      fsm.process(130);
      expect(sellFn).toHaveBeenCalledTimes(1);
    });

    describe("should go back to buy", () => {
      beforeEach(() => {
        fsm.process(95);
        expect(sellFn).toHaveBeenCalledTimes(1);
        expect(buyFn).toHaveBeenCalledTimes(1);
      });

      test("should not re-enter buy", () => {
        fsm.process(80);
        expect(sellFn).toHaveBeenCalledTimes(1);
        expect(buyFn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
