import Post, { postInterface } from "./Posts";
import React, { useEffect, useState, useMemo } from "react";

import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS } from "@gumhq/sdk";
import axios from "axios";
interface PostAccount {
  cl_pubkey: string;
  metadatauri: string;
  profile: string;
}
const ExplorePosts = () => {
  const [explore, setExplore] = useState<postInterface[]>([]);
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

  const wallet = useWallet();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postAccounts =
          (await sdk?.post.getAllPosts()) as Array<PostAccount>;
        const userPost = await sdk?.post.getPostAccountsByUser(
          wallet.publicKey
            ? wallet.publicKey
            : new PublicKey("G9on1ddvCc8xqfk2zMceky2GeSfVfhU8JqGHxNEWB5u4")
        );
        console.log(userPost);
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
          postAccounts.map(async (post) => {
            let postData = await axios.get(post.metadatauri);
            return {
              postData,
              metadatauri: post.metadatauri,
              cl_pubkey: post.cl_pubkey,
            };
          })
        );

        postAccountMetadata.forEach((data) => {
          let postCotext = data.postData.data as postInterface;
          if (
            postCotext.content.blocks?.filter((block) => {
              return (
                block.type == "header" && block.data.text == "Created in Daisi"
              );
            }).length > 0
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
    fetchData();
  }, [wallet]);

  return (
    <div>
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
