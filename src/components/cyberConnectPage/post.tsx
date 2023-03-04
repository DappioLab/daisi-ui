import { IRootState } from "@/redux";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { checkNetwork, connectWallet } from "./helper/wallet";
import { v4 as uuidv4 } from "uuid";
import request from "graphql-request";
import { cyberConnectEndpoint } from "@/graphql/cyberConnect/query";
import {
  CREATE_REGISTER_ESSENCE_TYPED_DATA,
  RELAY,
} from "@/graphql/cyberConnect/mutation";
import { create } from "ipfs-http-client";

interface IPostInput {
  nftImageURL: string;
  content: string;
  middleware: string;
}

const Post = () => {
  const { accessToken, primaryProfile } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const [postInput, setPostInput] = useState<IPostInput>({
    nftImageURL: "",
    content: "",
    middleware: "free",
  });

  // TODO: .env.local show undefined in browser, but terminal can log
  const auth =
    "Basic " +
    Buffer.from(
      "2MKOnm6IhNBqLYJIAx1tVNrrP3G" + ":" + "2a192d1d29c89da90a77ad923b813718"
    ).toString("base64");

  const ipfsClient = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const handleOnClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // e.preventDefault();

    try {
      /* Check if the user logged in */
      if (!accessToken) {
        throw Error("You need to Sign in.");
      }

      /* Check if the has signed up */
      if (!primaryProfile?.profileID) {
        throw Error("You need to mint a profile.");
      }

      /* Connect wallet and get provider */
      const provider = await connectWallet();

      /* Check if the network is the correct one */
      await checkNetwork(provider);

      /* Construct the metadata object for the Essence NFT */
      const metadata = {
        metadata_id: uuidv4(),
        version: "1.0.0",
        app_id: "cyberconnect-bnbt",
        lang: "en",
        issue_date: new Date().toISOString(),
        content: postInput.content,
        media: [],
        tags: [],
        image: postInput.nftImageURL,
        image_data: "",
        name: `@${primaryProfile?.handle}'s post`,
        description: `@${primaryProfile?.handle}'s post on CyberConnect Content app`,
        animation_url: "",
        external_url: "",
        attributes: [],
      };

      const data = JSON.stringify(metadata);
      const res = await ipfsClient.add(data);
      /* Upload metadata to IPFS */
      const ipfsHash = res.path; //await pinJSONToIPFS(metadata);

      /* Get the signer from the provider */
      const signer = provider.getSigner();

      /* Create typed data in a readable format */
      const typedDataResult = await request({
        url: cyberConnectEndpoint,
        document: CREATE_REGISTER_ESSENCE_TYPED_DATA,
        variables: {
          input: {
            /* The profile id under which the Essence is registered */
            profileID: primaryProfile?.profileID,
            /* Name of the Essence */
            name: "Post",
            /* Symbol of the Essence */
            symbol: "POST",
            /* URL for the json object containing data about content and the Essence NFT */
            tokenURI: `https://daisi.infura-ipfs.io/ipfs/${ipfsHash}`,
            /* Middleware that allows users to collect the Essence NFT for free */
            middleware: { collectFree: true },
            /* Set if the Essence should be transferable or not */
            transferable: true,
          },
        },
        requestHeaders: {
          Authorization: accessToken,
          "X-API-KEY": "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u",
        },
      });

      const typedData =
        // @ts-ignore
        typedDataResult?.createRegisterEssenceTypedData?.typedData;
      const message = typedData.data;
      const typedDataID = typedData.id;

      /* Get the signature for the message signed with the wallet */
      const fromAddress = await signer.getAddress();
      const params = [fromAddress, message];
      const method = "eth_signTypedData_v4";
      const signature = await signer.provider.send(method, params);

      /* Call the relay to broadcast the transaction */
      const relayResult = await request({
        url: cyberConnectEndpoint,
        document: RELAY,
        variables: {
          input: {
            typedDataID: typedDataID,
            signature: signature,
          },
        },
        requestHeaders: {
          Authorization: accessToken,
          "X-API-KEY": "Cpdjzg8Yv91z5ds7EYFmN8pXQJfMzX4u",
        },
      });

      // @ts-ignore
      const relayActionId = relayResult.relay.relayActionId;

      setPostInput({
        nftImageURL: "",
        content: "",
        middleware: "free",
      });

      // /* Close Post Modal */
      // handleModal(null, "");

      // const relayingPost = {
      // 	createdBy: {
      // 		handle: primaryProfile?.handle,
      // 		avatar: primaryProfile?.avatar,
      // 		metadata: primaryProfile?.metadata,
      // 		profileID: primaryProfile?.profileID,
      // 	},
      // 	essenceID: 0, // Value will be updated once it's indexed
      // 	tokenURI: `https://cyberconnect.mypinata.cloud/ipfs/${ipfsHash}`,
      // 	isIndexed: false,
      // 	isCollectedByMe: false,
      // 	collectMw: undefined,
      // 	relayActionId: relayActionId,
      // };

      // localStorage.setItem(
      // 	"relayingPosts",
      // 	JSON.stringify([...indexingPosts, relayingPost])
      // );
      // /* Set the indexingPosts in the state variables */
      // setIndexingPosts([...indexingPosts, relayingPost]);

      // /* Display success message */
      // handleModal("success", "Post was created!");
    } catch (error) {
      console.log(error);
      /* Set the indexingPosts in the state variables */
      // setIndexingPosts([...indexingPosts]);
      // /* Display error message */
      // const message = error.message as string;
      // handleModal("error", message);
    }
  };

  return (
    <div>
      <h2>Create Post</h2>
      <div>
        <label>NFT image url</label>
        <input
          value={postInput.nftImageURL}
          onChange={(e) =>
            setPostInput({ ...postInput, nftImageURL: e.target.value })
          }
          placeholder="https://"
        ></input>
      </div>
      <div>
        <label>Post message</label>
        <textarea
          value={postInput.content}
          onChange={(e) =>
            setPostInput({ ...postInput, content: e.target.value })
          }
          placeholder="What's on your mind?"
        ></textarea>
      </div>

      <button onClick={handleOnClick}>Post</button>
    </div>
  );
};

export default Post;
