import request from "graphql-request";
import { CYBER_CONNECT_ENDPOINT, DOMAIN } from "./constants";
import {
  LOGIN_GET_MESSAGE_MUTATION,
  LOGIN_VERIFY_MUTATION,
} from "@/graphql/cyberConnect/mutation";
import { Web3Provider } from "@ethersproject/providers";

export const signIn = async (address: string, provider: Web3Provider) => {
  try {
    /* Get the signer from the provider */
    const signer = provider.getSigner();
    /* Get the message from the server */
    const messageResult = await request(
      CYBER_CONNECT_ENDPOINT,
      LOGIN_GET_MESSAGE_MUTATION,
      {
        address,
        domain: DOMAIN,
      }
    );
    // @ts-ignore
    const message = messageResult?.loginGetMessage?.message;

    /* Get the signature for the message signed with the wallet */
    const signature = await signer.signMessage(message);

    /* Verify the signature on the server and get the access token */
    const accessTokenResult = await request(
      CYBER_CONNECT_ENDPOINT,
      LOGIN_VERIFY_MUTATION,
      {
        address,
        domain: DOMAIN,
        signature: signature,
      }
    );

    // @ts-ignore
    const accessToken = accessTokenResult?.loginVerify?.accessToken;

    return `bearer ${accessToken}`;
  } catch (err) {
    console.log(err);
  }
};
