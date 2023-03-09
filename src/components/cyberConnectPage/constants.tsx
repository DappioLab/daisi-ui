export const DOMAIN = "daisi.social";
export const BETWEEN_FETCH_INTERVAL = 3; // unit: second(s)
export const DAISI_DB_ENDPOINT = process.env.NEXT_PUBLIC_SERVER_ENDPOINT
  ? process.env.NEXT_PUBLIC_SERVER_ENDPOINT + "/"
  : "https://localhost:8000/";
export const ARWEAVE_ENDPOINT = "https://arweave.net/";
export const CYBER_CONNECT_ENDPOINT = "https://api.cyberconnect.dev/testnet/";
export const IPFS_GATEWAY = "https://daisi.infura-ipfs.io/";

// TODO: deprecate and move to .env
export const X_API_KEY =
  process.env.CYBER_CONNECT_API_KEY ?? "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u";
export const PROJECT_ID =
  process.env.INFURA_PUBLIC_KEY ?? "2MKOnm6IhNBqLYJIAx1tVNrrP3G";
export const API_KEY =
  process.env.INFURA_SECRET_KEY ?? "2a192d1d29c89da90a77ad923b813718";
