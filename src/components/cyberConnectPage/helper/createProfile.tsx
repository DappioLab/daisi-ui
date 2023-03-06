import {
  CREATE_PROFILE_TYPED_DATA,
  RELAY,
} from "@/graphql/cyberConnect/mutation";
import request from "graphql-request";
import { CYBERCONNECT_ENDPOINT, X_API_KEY } from "../constants";
import { IPFSHTTPClient } from "ipfs-http-client";
// import { GET_RELAY_ACTION_STATUS_QUERY } from "@/graphql/cyberConnect/query";

export const createProfile = async ({
  handle,
  address,
  accessToken,
  ipfsClient,
}: {
  handle: string;
  address: string;
  accessToken: string;
  ipfsClient: IPFSHTTPClient;
}) => {
  try {
    if (!handle) {
      alert("handle can't be undefined!");
      return;
    } else if (handle && !/^[a-z0-9_]{1,20}$/.test(handle)) {
      alert(
        "Input value must be between 1 and 20 lowercase letters, digits or underscores."
      );
      return;
    }
    if (!address) {
      alert("address can't be undefined!");
      return;
    }
    if (!accessToken) {
      alert("accessToken can't be undefined!");
      return;
    }

    const metadata = {
      handle,
      name: "",
      type: "",
      bio: "",
      title: "",
      organization: "",
      name_type: "",
      avatar_type: "",
      version: "1.0.0",
    };

    const data = JSON.stringify(metadata);
    const res = await ipfsClient.add(data);
    /* Upload metadata to IPFS */
    const ipfsHash = res.path;

    // TODO: Upload metadata to IPFS
    const createProfileTypedDataResult = await request({
      url: CYBERCONNECT_ENDPOINT,
      document: CREATE_PROFILE_TYPED_DATA,
      variables: {
        input: {
          to: address,
          handle: handle.toLowerCase(),
          avatar: "",
          metadata: ipfsHash,
          operator: "0x0000000000000000000000000000000000000000",
          minHandleLength: 1,
        },
      },
      requestHeaders: {
        Authorization: accessToken,
        "X-API-KEY": X_API_KEY,
      },
    });
    const typedDataID =
      //@ts-ignore
      createProfileTypedDataResult?.createCreateProfileTypedData?.typedDataID;

    const relayResult = await request({
      url: CYBERCONNECT_ENDPOINT,
      document: RELAY,
      variables: {
        input: {
          typedDataID,
          signature: "",
        },
      },
      requestHeaders: {
        Authorization: accessToken,
        "X-API-KEY": X_API_KEY,
      },
    });

    //@ts-ignore
    const relayActionId = relayResult.relay.relayActionId;
    console.log("relayActionId:", relayActionId);

    // TODO: Handle relay action status
    return {
      status: "QUEUED",
      relayActionId,
    };
  } catch (error) {
    throw error;
  }
};

export const checkRelayActionStatus = async (relayActionId: string) => {
  // const res = await request(
  //   CYBERCONNECT_ENDPOINT,
  //   GET_RELAY_ACTION_STATUS_QUERY,
  //   { relayActionId }
  // );
  // //@ts-ignore
  // if (res.reason) {
  //   return {
  //     status: "Failed",
  //     //@ts-ignore
  //     message: res.reason,
  //   };
  // } else {
  //   return {
  //     status: "SUCCESS",
  //     //@ts-ignore
  //     message: `https://testnet.bscscan.com/tx/${res.txHash}`,
  //   };
  // }
};
