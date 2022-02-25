
import { BundleModule, convertNameToModuleType, ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
import * as webconfig from "./webconfig.json";
import fs = require("fs");
require('dotenv').config();

const PRIVATE_KEY = process.env["PRIVATE_KEY"] as string;
const MODULE = webconfig.MODULE as string;
const PROVIDER = webconfig.PROVIDER as string;

let ERROR_NUM = 0;
let ERROR_MAX = 10;

type WalletAddress = {
  address: string;
  amount: number;
}

type TransferLog = {
  data: Receipt[],
  error: any
}

type Receipt = {
  hash: string | "";
  to: string;
  amount: number;
  error?: any;
  error_code?: string;
}


function readJson(filepath: string): WalletAddress[] {
  const records = JSON.parse(fs.readFileSync(webconfig.TRANSFER_INPUT_PATH, 'utf8'));
  return records;
}

const transferSingle = async (address: string, token_id: string, amount: number, module: BundleModule): Promise<Receipt> => {
  try {
    const tx = await module.transfer(address, token_id, amount);
    return { hash: tx.transactionHash, to: address, amount: amount };
  } catch (error: any) {
    console.error(error);
    if (error.code == "SERVER_ERROR") {
      ERROR_NUM++;
      console.log("ERROR_NUM = " + ERROR_NUM);
      if (ERROR_NUM > ERROR_MAX) throw error;
      return { hash: "", to: address, amount: amount, error: error, error_code: "SERVER_ERROR" };
    } else {
      throw error;
    }
  }
}

const transfer = async (wallet_address: WalletAddress[], module: BundleModule): Promise<void> => {
  let receipt;
  let log: TransferLog = { data: [], error: undefined };

  try {
    for (const ad of wallet_address) {
      receipt = await transferSingle(ad.address, webconfig.TOKEN_ID, ad.amount, module);
      log.data.push(receipt);
      console.log("transfer done.hash:", receipt.hash, " - to:", ad.address, " - amount:", ad.amount);
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
  await transfer(wallet_address, bundle);
  if (webconfig.RESTRICTED_TRANSFER) {
    await bundle.setRestrictedTransfer(true);
  }
}

main();
