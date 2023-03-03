import {
  CREATE_PROFILE_TYPED_DATA,
  RELAY,
} from "@/graphql/cyberConnect/mutation";
import { cyberConnectEndpoint } from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import request from "graphql-request";
import { useState } from "react";
import { useSelector } from "react-redux";

const CreateProfile = () => {
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState("");
  const { accessToken, address } = useSelector(
    (state: IRootState) => state.cyberConnect
  );

  const handleOnClick = async () => {
    try {
      // TODO: Upload metadata to IPFS
      const createProfileTypedDataResult = await request({
        url: cyberConnectEndpoint,
        document: CREATE_PROFILE_TYPED_DATA,
        variables: {
          input: {
            to: address,
            handle: handle.toLowerCase(),
            avatar,
            metadata: "",
            operator: "0x0000000000000000000000000000000000000000",
            minHandleLength: 1,
          },
        },
        requestHeaders: {
          Authorization: accessToken!,
          "X-API-KEY": "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u",
        },
      });
      const typedDataID =
        createProfileTypedDataResult?.createCreateProfileTypedData?.typedDataID;

      const relayResult = await request({
        url: cyberConnectEndpoint,
        document: RELAY,
        variables: {
          input: {
            typedDataID,
            signature: "",
          },
        },
        requestHeaders: {
          Authorization: accessToken!,
          "X-API-KEY": "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u",
        },
      });

      const relayActionId = relayResult.relay.relayActionId;
      console.log("relayActionId:", relayActionId);

      // TODO: Handle relay action status

      setHandle("");
      setAvatar("");
    } catch (error) {
      throw error;
    }
  };

  return (
    <div>
      <h2>New handle</h2>
      <input
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="What's your handle?"
      />
      <h2>Avatar URL</h2>
      <input
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="What's avatar url?"
      />
      <button onClick={handleOnClick}>Create Profile</button>
    </div>
  );
};

export default CreateProfile;
