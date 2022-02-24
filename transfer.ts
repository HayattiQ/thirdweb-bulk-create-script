
import { BundleModule, convertNameToModuleType, ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
import * as webconfig from "./webconfig.json";
import fs = require("fs");
require('dotenv').config();

const PRIVATE_KEY = process.env["PRIVATE_KEY"] as string;
const MODULE = webconfig.MODULE as string;
const PROVIDER = webconfig.PROVIDER as string;

type WalletAddress = {
  address: string;
  amount: number;
}

type TransferLog = {
  data: {
    hash: string;
    to: string;
    amount: number;
  }[],
  error: any
}


function readJson(filepath: string): WalletAddress[] {
  const records = JSON.parse(fs.readFileSync(webconfig.TRANSFER_INPUT_PATH, 'utf8'));
  return records;
}

const transfer = async (wallet_address: WalletAddress[], module: BundleModule): Promise<void> => {
  let receipt;
  let log: TransferLog = { data: [], error: undefined };

  try {
    for (const ad of wallet_address) {
      receipt = await module.transfer(ad.address, webconfig.TOKEN_ID, ad.amount)
      log.data.push({
        hash: receipt.transactionHash,
        to: ad.address,
        amount: ad.amount
      });
      console.log("transfer done.hash:", receipt.transactionHash, " - to:", ad.address, " - amount:", ad.amount);
    }
    fs.writeFileSync('./log/output.' + Date.now() + '.json', JSON.stringify(log, undefined, 1));
  } catch (error) {
    console.error("error found." + error);
    log.error = error;
    fs.writeFileSync('./log/error.' + Date.now() + '.json', JSON.stringify(log, undefined, 1));
  }

}


const main = async () => {
  const wallet_address = readJson(webconfig.TRANSFER_INPUT_PATH);
  const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.getDefaultProvider(PROVIDER));
  const sdk = new ThirdwebSDK(wallet);
  const bundle = sdk.getBundleModule(MODULE);
  await bundle.setRestrictedTransfer(false);
  await transfer(wallet_address, bundle);
  if (webconfig.RESTRICTED_TRANSFER) {
    await bundle.setRestrictedTransfer(true);
  }
}

main();
