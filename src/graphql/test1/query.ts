import request from "graphql-request";
const serviceEndpoint = "https://services.dappio.xyz/graphql";

export const getData = async () => {
  const query = `
    {
      TokenInfos {
        chainId
        price
        mint
        name
        decimals
        symbol
        logoURI
      }
    }
    `;
  let data = await request(serviceEndpoint, query);
  return data.TokenInfos;
};
