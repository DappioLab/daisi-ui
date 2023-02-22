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

        let explorePosts: postInterface[] = [];
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

        postsMetadata.forEach((data) => {
          let postCotext = data.postData.data as postInterface;
          explorePosts.push({
            ...postCotext,
            metadatauri: data.metadatauri,
            cl_pubkey: data.cl_pubkey,
          });
        });
        console.log(explorePosts);
        setExplore(explorePosts);
      } catch (err) {
        console.log("error", err);
      }
    };
    fetchData();
  }, [wallet.publicKey?.toString()]);
  return (
    <div className="mt-6">
      {explore &&
        explore.map((post: postInterface) => {
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
