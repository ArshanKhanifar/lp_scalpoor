import { config } from "dotenv";
import { setup } from "./Config";
import { scalpEth } from "./scalps/eth_scalp";

config();
setup();

async function main() {
  scalpEth();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



