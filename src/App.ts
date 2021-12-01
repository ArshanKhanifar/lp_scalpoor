import { config } from "dotenv";
import { setup } from "./Config";
import { scalpBeans, States } from "./scalps/BeansScalpoor";

config();
setup();

async function main() {
  scalpBeans(States.BUY_BEANS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
