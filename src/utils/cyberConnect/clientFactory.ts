import { create } from "ipfs-http-client";
import { PROJECT_ID, API_KEY } from "./constants";
import CyberConnect from "@cyberlab/cyberconnect-v2";

const auth =
  "Basic " + Buffer.from(PROJECT_ID + ":" + API_KEY).toString("base64");

export const createIpfsClient = () => {
  return create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });
};

export const createCyberConnectClient = (provider: any) => {
  return new CyberConnect({
    namespace: "CyberConnect",
    env: "STAGING",
    provider: provider,
    signingMessageEntity: "CyberConnect",
  });
};
