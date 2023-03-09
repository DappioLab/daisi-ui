import {
  CREATE_PROFILE_TYPED_DATA,
  RELAY,
} from "@/graphql/cyberConnect/mutation";
import request from "graphql-request";
import { CYBER_CONNECT_ENDPOINT, X_API_KEY } from "../constants";
import { IPFSHTTPClient } from "ipfs-http-client";
import {
  GET_RELAY_ACTION_STATUS_QUERY,
  PROFILE_BY_ADDRESS_QUERY,
} from "@/graphql/cyberConnect/query";
import { IProfile } from "@/redux/cyberConnectSlice";

export const createProfile = async (
  handle: string,
  address: string,
  accessToken: string,
  ipfsClient: IPFSHTTPClient
) => {
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
      url: CYBER_CONNECT_ENDPOINT,
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
      url: CYBER_CONNECT_ENDPOINT,
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
      relayActionId,
    };
  } catch (error) {
    throw error;
  }
};

export const checkRelayActionStatus = async (relayActionId: string) => {
  const res = await request(
    CYBER_CONNECT_ENDPOINT,
    GET_RELAY_ACTION_STATUS_QUERY,
    { relayActionId }
  );
  console.log("checkRelayActionStatus:", res);
  //@ts-ignore
  if (res.relayActionStatus.reason) {
    return {
      status: "QUEUED/FAILED",
      //@ts-ignore
      message: res.relayActionStatus.reason,
    };
  } else {
    return {
      status: "SUCCESS",
      //@ts-ignore
      message: `https://testnet.bscscan.com/tx/${res.relayActionStatus.txHash}`,
    };
  }
};

export const getProfileByAddress = async (address: string) => {
  const daisiHandle = handleCreator(address);
  try {
    const res = await request(
      CYBER_CONNECT_ENDPOINT,
      PROFILE_BY_ADDRESS_QUERY,
      {
        address,
      }
    );

    //@ts-ignore
    if (res.address.wallet.profiles.edges.length == 0) {
      return false;
    }
    //@ts-ignore
    const profiles = res.address.wallet.profiles.edges.map(
      (edge: any) => edge.node
    );

    const profile = profiles.find(
      (profile: IProfile) => profile.handle.split(".")[0] == daisiHandle
    );
    return profile;
  } catch (err) {}
};

export const handleCreator = (address: string, nonce?: number) => {
  const handle = `daisi_${address.slice(0, 6)}_${address.slice(
    -4
  )}`.toLowerCase();

  if (!nonce) {
    return handle;
  } else {
    nonce = nonce % 100;
    return `${handle}_${nonce}`;
  }
};
