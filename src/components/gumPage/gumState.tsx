import Post, { postInterface } from "./Posts";
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
  updateAllUser,
  updateAllFollow,
  updateReplies,
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
  const { userProfile, allUser } = useSelector(
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
      // const allPostAccounts =
      //   (await sdk?.post.getAllPosts()) as Array<PostAccount>;
      const allPostAccounts = [];
      // parts for reply
      let replyMap = new Map<string, ReplyInterface[]>();
      const allPostLocal = await sdk.post.getPostAccounts();

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
      [...userPostAccounts, ...allPostsMetadata]
        .filter((data) => {
          return data.replyTo && data.postData.data.content.content;
        })
        .forEach((data) => {
          replyMap.set(data.replyTo.toString(), [
            {
              from: data.profile,
              text: data.postData.data.content.content,
              cl_pubkey: data.cl_pubkey,
            },
            ...(replyMap.has(data.replyTo.toString())
              ? replyMap.get(data.replyTo.toString())
              : []),
          ]);
        });
      dispatch(updateReplies(replyMap));
      dispatch(
        updatePosts(
          [...userPostAccounts, ...allPostsMetadata]
            .filter((data) => {
              let postCotext = data?.postData.data as postInterface;

              return (
                // @ts-ignore
                postCotext.daisiContent &&
                // @ts-ignore
                postCotext.daisiContent.itemImage.includes("https") &&
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
              let postPubkey = data ? data.cl_pubkey : PublicKey.default;
              return {
                ...postCotext,
                metadatauri: data?.metadatauri,
                cl_pubkey: postPubkey,
                profile: data ? data.profile : PublicKey.default,
                replies: replyMap.has(postPubkey.toString())
                  ? replyMap.get(postPubkey.toString())
                  : [],
              };
            })
        )
      );
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
  const fetchAllConnection = async () => {
    if (allUser.size) {
      let connections = await sdk.connection.getALlConnectionAccounts();
      let followingMap: Map<string, ProfileAccount[]> = new Map();
      let followByMap: Map<string, ProfileAccount[]> = new Map();
      for (let connection of connections) {
        let toUser = allUser.get(connection.account.toProfile.toString());
        followByMap.set(
          connection.account.fromProfile.toString(),
          followByMap.has(connection.account.fromProfile.toString())
            ? [
                ...followByMap.get(connection.account.fromProfile.toString()),
                toUser,
              ]
            : [toUser]
        );
        let fromUser = allUser.get(connection.account.fromProfile.toString());
        followingMap.set(
          connection.account.toProfile.toString(),
          followingMap.has(connection.account.toProfile.toString())
            ? [
                ...followingMap.get(connection.account.toProfile.toString()),
                fromUser,
              ]
            : [fromUser]
        );
      }
      dispatch(
        updateAllFollow({ following: followingMap, followers: followByMap })
      );
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
  const fetchUsers = async () => {
    let allUser = await sdk.profile.getProfileAccountsByUser();
    let userKey = await sdk.user.getAllUsersAccounts();
    let userMap = new Map(
      userKey.map((userA) => {
        return [userA.cl_pubkey.toString(), userA.authority];
      })
    );
    let map: Map<string, ProfileAccount> = new Map(
      allUser.map((user) => {
        return [
          user.publicKey.toString(),
          {
            profile: user.publicKey,
            user: user.account.user,
            wallet: new PublicKey(userMap.get(user.account.user.toString())),
          },
        ];
      })
    );
    dispatch(updateAllUser(map));
  };
  useEffect(() => {
    fetchProfile();
    fetchConnections();
  }, [wallet.connected, userProfile]);
  useEffect(() => {
    fetchPostData();
    fetchReaction();
    fetchUsers();
  }, []);
  useEffect(() => {
    fetchAllConnection();
  }, [allUser]);
};
export default useGumState;

export const PostList = (prop: { profiles?: PublicKey[] }) => {
  const { allPosts } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  let filtered = filterPostList(allPosts, prop.profiles);
  return (
    <div>
      {filtered.length > 0 &&
        filtered.map((post) => {
          return (
            <div key={post.cl_pubkey.toString()} className="">
              <Post post={post} />
            </div>
          );
        })}
    </div>
  );
};
export function filterPostList(
  allPosts: postInterface[],
  profiles?: PublicKey[]
) {
  if (profiles) {
    let strProfile = profiles.map((pro) => {
      return pro.toString();
    });
    return allPosts.filter((post) => {
      return strProfile.includes(post.profile.toString());
    });
  }
  return allPosts;
}
