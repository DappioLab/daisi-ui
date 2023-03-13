import {
  CREATE_PROFILE_TYPED_DATA,
  RELAY,
} from "@/graphql/cyberConnect/mutation";
import { CYBER_CONNECT_ENDPOINT } from "@/components/cyberConnectPage/constants";
import { IRootState } from "@/redux";
import request from "graphql-request";
import { useState } from "react";
import { useSelector } from "react-redux";

const CreateProfile = () => {
  const [handle, setHandle] = useState("");
  const [avatar, setAvatar] = useState("");
  const { accessToken, address } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  const handleOnClick = async () => {
    try {
      // TODO: Upload metadata to IPFS
      const createProfileTypedDataResult = await request({
        url: CYBER_CONNECT_ENDPOINT,
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
          Authorization: accessToken!,
          "X-API-KEY": "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u",
        },
      });

      //@ts-ignore
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
        pattern="^[a-z0-9_]{1,20}$"
        required
      />
      {handle && !/^[a-z0-9_]{1,20}$/.test(handle) && (
        <div className="error-message">
          Input value must be between 1 and 20 lowercase letters, digits or
          underscores.
        </div>
      )}
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
