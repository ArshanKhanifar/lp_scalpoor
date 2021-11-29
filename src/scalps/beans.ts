import {ContractId} from "../AddressBook";
import {PriceCallback, watchPrice} from "../PriceWatchoor";
import {getWethPrice} from "../EthPriceUtility";

const watchBeanPrice = async (callback: PriceCallback) => {
  await watchPrice(ContractId.WETH_BEAN, ContractId.WETH, async (beanPerEth) => {
    const ethPrice = await getWethPrice();
    const beanPrice = beanPerEth * ethPrice;
    callback(beanPrice);
  });
};

export const scalpBeans = async () => {
  watchBeanPrice((beanPrice) => {
    console.log("bean price", beanPrice);
  });
};
