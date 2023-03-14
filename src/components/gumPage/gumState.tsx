import Post, { postInterface } from "./PostsMigrated";
import React, { useEffect, useState, useMemo } from "react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { ReactionType } from "@/gpl-core/src/reaction";
import axios from "axios";
import { mainGateway } from "./storage";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserAccounts,
  updateUserProfile,
  updateFollowers,
  updateFollowing,
  updateReactions,
  updatePosts,
} from "@/redux/gumSlice";
import { IRootState } from "@/redux";

interface PostAccount {
  cl_pubkey: string;
  metadatauri: string;
  profile: string;
  replyto?: string;
}
export interface ConnectionInterface {
  follow: PublicKey;
  cl_pubkey: PublicKey;
}
export interface ReactionInterface {
  from: PublicKey;
  type: ReactionType;
  cl_pubkey: PublicKey;
  replyTo?: PublicKey;
}
export interface ReplyInterface {
  from: PublicKey;
  text: string;
  cl_pubkey: PublicKey;
}
export interface ProfileAccount {
  profile: PublicKey;
  user: PublicKey;
  wallet: PublicKey;
}
export const CREATED_IN_DAISI_TAG = "Created in Daisi";
const useGumState = () => {
  const wallet = useWallet();
  const dispatch = useDispatch();
  const sdk = useGumSDK();
  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const fetchProfile = async () => {
    if (wallet.publicKey && !userProfile) {
      let profileKeys = await sdk?.profile.getProfileAccountsByUser(
        wallet.publicKey
      );

      if (profileKeys.length > 0) {
        dispatch(
          updateUserProfile(
            profileKeys
              .map((pa) => {
                return {
                  profile: pa.publicKey,
                  user: pa.account.user,
                  wallet: wallet.publicKey,
                };
              })
              .sort()[0]
          )
        );
      }
      let userKeys = await sdk?.user.getUserAccountsByUser(wallet.publicKey);
      if (userKeys.length > 0) {
        dispatch(
          updateUserAccounts(
            userKeys.map((account) => {
              return account.publicKey;
            })
          )
        );
      }
    }
  };
  const fetchPostData = async () => {
    try {
      const allPostAccounts =
        (await sdk?.post.getAllPosts()) as Array<PostAccount>;
      // parts for reply
      // let replyMap = new Map<string, ReplyInterface[]>();
      const allPostLocal = await sdk.post.getPostAccounts();
      console.log(allPostAccounts.length, allPostLocal.length);
      let userPostAccounts = allPostLocal
        ? await Promise.all(
            allPostLocal.map(async (post) => {
              try {
                if (post.account.metadataUri.includes("/ipfs/")) {
                  let postData = await axios.get(
                    mainGateway +
                      post.account.metadataUri.substring(
                        post.account.metadataUri.indexOf("/ipfs/") + 6
                      )
                  );
                  return {
                    postData,
                    metadatauri: post.account.metadataUri,
                    cl_pubkey: post.publicKey,
                    profile: post.account.profile as PublicKey,
                    replyTo: post.account.replyTo
                      ? (post.account.replyTo as PublicKey)
                      : null,
                  };
                }
                let postData = await axios.get(post.account.metadataUri);
                return {
                  postData,
                  metadatauri: post.account.metadataUri,
                  cl_pubkey: post.publicKey,
                  profile: post?.account.profile as PublicKey,
                  replyTo: post.account.replyTo
                    ? (post.account.replyTo as PublicKey)
                    : null,
                };
              } catch (err) {
                console.log(err);
              }
            })
          )
        : [];

      let allPostsMetadata = await Promise.all(
        allPostAccounts
          .filter((post) => {
            return !userPostAccounts.find((userPost) => {
              return post.cl_pubkey == userPost?.cl_pubkey.toString();
            });
          })
          .map(async (post) => {
            try {
              if (post.metadatauri.includes("/ipfs/")) {
                let postData = await axios.get(
                  mainGateway +
                    post.metadatauri.substring(
                      post.metadatauri.indexOf("/ipfs/") + 6
                    )
                );
                return {
                  postData,
                  metadatauri: post.metadatauri,
                  cl_pubkey: new PublicKey(post.cl_pubkey),
                  profile: new PublicKey(post.profile),
                  replyTo: post.replyto ? new PublicKey(post.replyto) : null,
                };
              }

              let postData = await axios.get(post.metadatauri);

              return {
                postData,
                metadatauri: post.metadatauri,
                cl_pubkey: new PublicKey(post.cl_pubkey),
                profile: new PublicKey(post.profile),
                replyTo: post.replyto ? new PublicKey(post.replyto) : null,
              };
            } catch (err) {}
          })
      );
      dispatch(
        updatePosts(
          [...userPostAccounts, ...allPostsMetadata]
            .filter((data) => {
              let postCotext = data?.postData.data as postInterface;
              return (
                // @ts-ignore
                postContext.daisiContent &&
                // @ts-ignore
                postContext.daisiContent.itemImage.includes("https") &&
                data?.postData.status == 200 &&
                postCotext.content.blocks?.find((block) => {
                  return (
                    block.type == "header" &&
                    block.data.text == CREATED_IN_DAISI_TAG
                  );
                })
              );
            })
            .map((data) => {
    
              let postCotext = data?.postData.data as postInterface;
              return {
                ...postCotext,
                metadatauri: data?.metadatauri,
                cl_pubkey: data ? data.cl_pubkey : PublicKey.default,
                profile: data ? data.profile : PublicKey.default,
              };
            })
        )
      );
      // parts for reply
      // [...userPostAccounts, ...allPostsMetadata]
      //   .filter((data) => {
      //     return data.replyTo && data.postData.data.content.content;
      //   })
      //   .forEach((data) => {
      //     replyMap.set(data.replyTo.toString(), [
      //       {
      //         from: data.profile,
      //         text: data.postData.data.content.content,
      //         cl_pubkey: data.cl_pubkey,
      //       },
      //       ...(replyMap.has(data.replyTo.toString())
      //         ? replyMap.get(data.replyTo.toString())
      //         : []),
      //     ]);
      //   });

      // setReply(replyMap);
    } catch (err) {
      console.log("error", err);
    }
  };
  const fetchConnections = async () => {
    try {
      if (wallet.publicKey && userProfile) {
        let following = await sdk?.connection.getALlConnectionAccounts(
          new PublicKey(userProfile.profile)
        );
        let followers = await sdk?.connection.getALlConnectionAccounts(
          undefined,
          new PublicKey(userProfile.profile)
        );

        dispatch(
          updateFollowing(
            (following ? following : []).map((conn) => {
              return {
                follow: conn.account.toProfile,
                cl_pubkey: conn.publicKey,
              };
            })
          )
        );
        dispatch(
          updateFollowers(
            (followers ? followers : []).map((conn) => {
              return conn.account.fromProfile;
            })
          )
        );
      }
    } catch (err) {
      console.log("error", err);
    }
  };
  const fetchReaction = async () => {
    let reactionAccounts = await sdk.reaction.getAllReactionAccounts();
    // let reactions = await sdk.reaction.getAllReactions();
    let map = new Map<
      string,
      { from: PublicKey; type: ReactionType; cl_pubkey: PublicKey }[]
    >();
    reactionAccounts.forEach((account) => {
      map.set(account.account.toPost.toString(), [
        {
          from: account.account.fromProfile,
          type: account.account.reactionType,
          cl_pubkey: account.publicKey,
        },
        ...(map.has(account.account.toPost.toString())
          ? map.get(account.account.toPost.toString())!
          : []),
      ]);
    });
    dispatch(updateReactions(map));
  };

  useEffect(() => {
    fetchProfile();
    fetchConnections();
  }, [wallet.connected, userProfile]);
  useEffect(() => {
    fetchPostData();
    fetchReaction();
  }, []);
};
export default useGumState;

export const PostList = (prop: { profiles?: PublicKey[] }) => {
  const { allPosts } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  if (prop.profiles) {
    return (
      <div>
        {allPosts.length > 0 &&
          prop.profiles.length > 1 &&
          allPosts
            .filter((post) => {
              return prop.profiles.includes(post.profile);
            })
            .map((post, index) => {
              return (
                <div key={post.cl_pubkey.toString()} className="">
                  <Post post={post} postIndex={index} fetchPostData={null} />
                </div>
              );
            })}
      </div>
    );
  }
  return (
    <div>
      {allPosts.length > 0 &&
        allPosts.map((post, index) => {
          return (
            <div key={post.cl_pubkey.toString()} className="">
              <Post post={post} postIndex={index} fetchPostData={null} />
            </div>
          );
        })}
    </div>
  );
};
