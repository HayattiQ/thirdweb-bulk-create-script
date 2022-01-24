
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from "ethers";
const fs = require("fs").promises;

require('dotenv').config();

const PRIVATE_KEY = process.env["PRIVATE_KEY"] as string;
const FOLDER = "./input/";
const DROP_MODULE = "0xB0fad666FDbA4a3C4054cB20f593A2dc2aFA21C6";

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
  image: any;
}

const makeMetaData = async (): Promise<Meta> => {
  const buff = await fs.readFile(FOLDER + "6.png");
  const metadata: Meta = {
    name: "TestV7Nam",
    description: "The description for the bundle drop.",
    external_url: "https://soudan-nft.xyz/",
    background_color: "FFFFFF",
    attributes: [
      {
        "trait_type": "Body",
        "value": "Beauty"
      },
      {
        "trait_type": "Background",
        "value": "Green"
      },
      {
        "trait_type": "Hair",
        "value": "longhair2"
      },
      {
        "display_type": "date",
        "trait_type": "birthday",
        "value": "Feb 14th"
      },
    ],
    image: buff,
  };

  return metadata;
}




const main = async () => {
  const metadata = await makeMetaData();
  const drop = sdk.getDropModule(DROP_MODULE);
  await drop.createBatch([metadata]);
}

main();