import { create } from "ipfs-http-client";
const projectId = "2MIhwQuXI2ocuaxhWO3nrq8HxmV";
const projectSecret = "58614cce0653d63460abcf0d9d983be8";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
export const ipfsClient = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  apiPath: "/api/v0",
  headers: {
    authorization: auth,
  },
});
export const mainGateway = "https://wei1769.infura-ipfs.io/ipfs/";