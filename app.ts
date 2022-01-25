
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
const fs = require("fs");
const Papa = require("papaparse");
require('dotenv').config();

const PRIVATE_KEY = process.env["PRIVATE_KEY"] as string;
const DROP_MODULE = "0xcb04ec5015856D367a3DA3376D349EF8dA9F621F";
const CSV_PATH = "./input/metadata.csv";

const wallet = new ethers.Wallet(PRIVATE_KEY, ethers.getDefaultProvider("https://rpc-mumbai.maticvigil.com"));
const sdk = new ThirdwebSDK(wallet);

type Meta = {
  name: string;
  description: string;
  external_url: string;
  background_color: string;
  attributes: {
    trait_type: string;
    value: string;
    display_type?: string;
  }[];
  image: string;
}

const convertToMetaRow = async (row: any): Promise<Meta> => {

  let metadata: Meta = {
    name: row.name,
    description: row.description,
    external_url: row.external_url,
    background_color: row.background_color,
    attributes: [],
    image: row.path,
  };

  for (let [key, value] of Object.entries(row)) {
    if (!["name", "description", "external_url", "background_color", "path"].includes(key)) {
      // @ts-ignore
      metadata.attributes[key as string] = {
        value: value as string,
        trait_type: key as string,
      };
    }
  };
  return metadata;
}

const makeMetaData = async (result: { data: any[] }): Promise<Meta[]> => {
  let metadata: Meta[] = [];
  for (let row of result.data) {
    metadata.push((await convertToMetaRow(row)));
  };
  return metadata;
}


function readCsv(filepath: string): Promise<Meta[]> {
  const file = fs.createReadStream(filepath)
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete(results: any) {
        resolve(makeMetaData(results))
      },
      error(err: any) {
        reject(err)
      }
    })
  })
}

const main = async () => {
  const metadata = await readCsv(CSV_PATH);
  console.log(metadata);
  const drop = sdk.getDropModule(DROP_MODULE);
  await drop.createBatch(metadata);
}

main();