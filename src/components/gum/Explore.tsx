import Post, { postInterface } from "./Posts";
import React, { useEffect, useState, useMemo } from "react";

import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS } from "@gumhq/sdk";
import axios from "axios";
import style from "@/styles/gumPage/explore.module.sass";

interface PostAccount {
  cl_pubkey: string;
  metadatauri: string;
  profile: string;
}
const ExplorePosts = () => {
  const wallet = useWallet();
  const [explore, setExplore] = useState<postInterface[]>([]);
  const [postText, setPostText] = useState("");
  const [profileKey, setProfileKey] = useState<
    { accountKey: PublicKey; userKey: PublicKey }[]
  >([]);
  const [userKey, setUserKey] = useState<PublicKey[]>([]);

  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com", "confirmed"),
    []
  );
  const sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );
  const fetchProfile = async () => {
    if (!wallet.publicKey) {
      throw "wallet Not Connected";
    }
    let profileKeys = await sdk?.profile.getProfileAccountsByUser(
      wallet.publicKey
    );
    if (profileKey.length <= 0 && profileKeys && profileKeys.length > 0) {
      setProfileKey(
        profileKeys.map((pa) => {
          return {
            accountKey: pa.publicKey,
            userKey: pa.account.authority,
          };
        })
      );
    }
    let userKeys = await sdk?.user.getUserAccountsByUser(wallet.publicKey);
    if (userKeys && userKeys.length > 0) {
      setUserKey(
        userKeys.map((pa) => {
          return pa.publicKey;
        })
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!wallet.publicKey) {
          throw "wallet Not Connected";
        }
        const postAccounts =
          (await sdk?.post.getAllPosts()) as Array<PostAccount>;
        const userPost = await sdk?.post.getPostAccountsByUser(
          wallet.publicKey
        );

        let explorePosts: postInterface[] = [];
        let postAccountMetadata = userPost
          ? await Promise.all(
              userPost.map(async (post) => {
                let postData = await axios.get(post.account.metadataUri);
                return {
                  postData,
                  metadatauri: post.account.metadataUri,
                  cl_pubkey: post.publicKey.toString(),
                };
              })
            )
          : [];
        let postsMetadata = await Promise.all(
          postAccounts
            .filter((post) => {
              return !postAccountMetadata.find((userPost) => {
                return post.cl_pubkey == userPost.cl_pubkey;
              });
            })
            .map(async (post) => {
              let postData = await axios.get(post.metadatauri);
              {
                return {
                  postData,
                  metadatauri: post.metadatauri,
                  cl_pubkey: post.cl_pubkey,
                };
              }
            })
        );

        [...postAccountMetadata, ...postsMetadata].forEach((data) => {
          let postCotext = data.postData.data as postInterface;
          if (
            data.postData.status == 200 &&
            postCotext.content.blocks?.find((block) => {
              return (
                block.type == "header" && block.data.text == "Created in Daisi"
              );
            })
          ) {
            explorePosts.push({
              ...postCotext,
              metadatauri: data.metadatauri,
              cl_pubkey: data.cl_pubkey,
            });
          }
        });

        setExplore(explorePosts);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchProfile();
    fetchData();
  }, [wallet.publicKey, profileKey]);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let data = {
        content: {
          blocks: [
            {
              id: "0",
              type: "header",
              data: { text: "Created in Daisi", level: 2 },
            },
            {
              id: "1",
              type: "paragraph",
              data: {
                text: postText,
              },
            },
          ],
        },
        type: "blocks",
        authorship: {
          signature: "0",
          publicKey: "0",
        },
        contentDigest: "0",
        signatureEncoding: "base64",
        digestEncoding: "hex",
        parentDigest: "",
      };

      let uploadRequest = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: JSON.stringify(data),
        headers: {
          pinata_api_key: `a0cd71f2761c20ee7879`,
          pinata_secret_api_key: `
          b4fb7e938759271cf16bbcfc066172d8a94c1b1797833079ae2b079c1eaba529`,
          "Content-Type": "application/json",
        },
      });

      if (wallet.publicKey) {
        if (profileKey.length > 0) {
          console.log("create Post ");
          let postIx = await sdk?.post.create(
            "https://cf-ipfs.com/ipfs/" + uploadRequest.data.IpfsHash,
            profileKey[0].accountKey,
            profileKey[0].userKey,
            wallet.publicKey
          );
          if (postIx) {
            console.log(await postIx.instructionMethodBuilder.rpc());
            window.location.reload();
          }
        }
      } else {
        alert("Wallet Not connected");
      }
    } catch (err) {
      console.log(err);
    }
  };
  let createProfileButton = null;
  const handleCreateProfile = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }

      if (userKey.length > 0) {
        console.log("creating profile");
        let result = await (
          await sdk?.profile.create(userKey[0], "Personal", wallet.publicKey)
        )?.instructionMethodBuilder.rpc();
        console.log(result);
        await fetchProfile();
      } else {
        console.log("creating user");

        let user = await sdk?.user.create(wallet.publicKey);

        let result = await user?.instructionMethodBuilder.rpc();

        console.log(result);
        await fetchProfile();
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (wallet.connected && userKey.length <= 0) {
    createProfileButton = (
      <button onClick={handleCreateProfile} className="">
        Create User
      </button>
    );
  } else if (wallet.connected && profileKey.length <= 0) {
    createProfileButton = (
      <button onClick={handleCreateProfile} className="">
        Create Profile
      </button>
    );
  }
  let form = null;
  if (profileKey.length > 0) {
    form = (
      <form className={style.post}>
        <textarea
          onChange={(e) => setPostText(e.target.value)}
          itemType="text"
          placeholder="What's happening"
        ></textarea>
        <button onClick={handleSubmit} className="">
          Post
        </button>
      </form>
    );
  }
  return (
    <div>
      <div>{createProfileButton}</div>
      <div>{form}</div>
      {explore?.map((post: postInterface) => {
        return (
          <div key={post.cl_pubkey} className="p-2">
            <Post post={post} setData={setExplore} />
          </div>
        );
      })}
    </div>
  );
};

export default ExplorePosts;
