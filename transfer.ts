
import { BundleModule, convertNameToModuleType, ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
import * as webconfig from "./webconfig.json";
import fs = require("fs");
require('dotenv').config();

const PRIVATE_KEY = process.env["PRIVATE_KEY"] as string;
const MODULE = webconfig.MODULE as string;
const PROVIDER = webconfig.PROVIDER as string;
const token_id = "1";

type WalletAddress = {
  address: string;
  amount: number;
}


function readJson(filepath: string): WalletAddress[] {
  const records = JSON.parse(fs.readFileSync(webconfig.TRANSFER_INPUT_PATH, 'utf8'));
  return records;
}

const transfer = async (wallet_address: WalletAddress[], module: BundleModule): Promise<void> => {
  let receipt;
  console.log("transfer_address", wallet_address);
  for (const ad of wallet_address) {
    receipt = await module.transfer(ad.address, token_id, ad.amount)
    console.log("transfer done.hash:", receipt.transactionHash, " - to:", ad.address, " - amount:", ad.amount);
  }
}


const main = async () => {
  const wallet_address = readJson(webconfig.TRANSFER_INPUT_PATH);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.getDefaultProvider(PROVIDER));
  const sdk = new ThirdwebSDK(wallet);
  const bundle = sdk.getBundleModule(MODULE);
  //await bundle.setRestrictedTransfer(false);
  transfer(wallet_address, bundle);
  /*
  await bundle.setRestrictedTransfer(true);*/
}

main();

function mapResult(v: WalletAddress): WalletAddress | PromiseLike<WalletAddress> {
  return { address: v.address, amount: v.amount };
}
