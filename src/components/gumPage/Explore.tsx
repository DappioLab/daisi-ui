import Post, { postInterface } from "./Posts";
import React, { useEffect, useState, useMemo } from "react";

import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS } from "../../gpl-core/src";
import { ReactionType } from "../../gpl-core/src/reaction";
import axios from "axios";
import style from "@/styles/gumPage/explore.module.sass";
import { ipfsClient, mainGateway } from "./storage";

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
  accountKey: PublicKey;
  userKey: PublicKey;
}
const ExplorePosts = () => {
  const wallet = useWallet();
  const [explore, setExplore] = useState<postInterface[]>([]);
  const [postText, setPostText] = useState("");
  const [profileKey, setProfileKey] = useState<ProfileAccount[]>([]);
  const [userKey, setUserKey] = useState<PublicKey[]>([]);
  const [postImg, setImg] = useState<File | null>(null);
  const [following, setfollowing] = useState<ConnectionInterface[]>([]);
  const [followers, setFollower] = useState<PublicKey[]>([]);
  const [reactions, setReactions] = useState<Map<string, ReactionInterface[]>>(
    new Map()
  );
  const [replies, setReply] = useState<Map<string, ReplyInterface[]>>(
    new Map()
  );
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );
  const sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );

  const fetchProfile = async () => {
    if (wallet.publicKey) {
      let profileKeys = await sdk?.profile.getProfileAccountsByUser(
        wallet.publicKey
      );
      if (profileKey.length <= 0 && profileKeys && profileKeys.length > 0) {
        setProfileKey(
          profileKeys.map((pa) => {
            return {
              accountKey: pa.publicKey,
              userKey: pa.account.user,
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
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        if (wallet.publicKey) {
          const allPostAccounts =
            (await sdk?.post.getAllPosts()) as Array<PostAccount>;
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
                      replyTo: post.replyto
                        ? new PublicKey(post.replyto)
                        : null,
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

          setExplore(
            [...userPostAccounts, ...allPostsMetadata]
              .filter((data) => {
                let postCotext = data?.postData.data as postInterface;
                return (
                  data?.postData.status == 200 &&
                  postCotext.content.blocks?.find((block) => {
                    return (
                      block.type == "header" &&
                      block.data.text == "Created in Daisi"
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

          setReply(replyMap);
        }
      } catch (err) {
        console.log("error", err);
      }
    };

    const fetchConnections = async () => {
      try {
        if (wallet.publicKey && profileKey.length > 0) {
          let following = await sdk?.connection.getALlConnectionAccounts(
            profileKey[0].accountKey
          );
          let followers = await sdk?.connection.getALlConnectionAccounts(
            undefined,
            profileKey[0].accountKey
          );

          setfollowing(
            (following ? following : []).map((conn) => {
              return {
                follow: conn.account.toProfile,
                cl_pubkey: conn.publicKey,
              };
            })
          );
          setFollower(
            (followers ? followers : []).map((conn) => {
              return conn.account.fromProfile;
            })
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
      setReactions(map);
    };

    fetchProfile();
    fetchPostData();
    fetchConnections();
    fetchReaction();
  }, [wallet.publicKey, profileKey]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let data: any = {
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
      if (postImg) {
        let uploadedPic = await ipfsClient.add(postImg);
        data.content.blocks.push({
          id: "2",
          type: "image",
          data: { file: { url: mainGateway + uploadedPic.path } },
        });
      }
      let uploadMetadata = await ipfsClient.add(JSON.stringify(data));

      if (wallet.publicKey) {
        if (profileKey.length > 0) {
          let postIx = await sdk?.post.create(
            mainGateway + uploadMetadata.path,
            profileKey[0].accountKey,
            profileKey[0].userKey,
            wallet.publicKey
          );

          if (postIx) {
            let result = await postIx.instructionMethodBuilder.rpc();
            console.log(result);
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
  const handleAirdrop = async (e: any) => {
    if (wallet.publicKey) {
      let result = await connection.requestAirdrop(
        wallet.publicKey,
        1 * 10 ** 9
      );
      console.log(result);
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
      <form>
        <textarea
          onChange={(e) => setPostText(e.target.value)}
          itemType="text"
          placeholder="What's happening"
          className={style.post}
        ></textarea>

        <input
          type="file"
          name="myImage"
          onChange={(event) => {
            if (event.target.files) {
              setImg(event.target.files[0]);
            }
          }}
        />

        <button onClick={handleSubmit} className="">
          Post
        </button>
      </form>
    );
  }
  let userInfo = null;
  if (profileKey.length > 0) {
    userInfo = (
      <div>
        <h1 className={style.handle}>
          {"@" + profileKey[0].accountKey.toString()}
        </h1>
        <p className={style.sub}>
          Following: {following.length} Follower: {followers.length}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={handleAirdrop}>Airdrop 1 Sol</button>
      </div>
      {userInfo}
      <div>{createProfileButton}</div>
      <div>{form}</div>
      {explore?.map((post: postInterface) => {
        return (
          <div key={post.cl_pubkey.toString()} className="">
            <Post
              post={post}
              setData={setExplore}
              userProfile={profileKey[0]}
              sdk={sdk}
              following={following}
              reactions={reactions.get(post.cl_pubkey.toString())}
              replies={replies.get(post.cl_pubkey.toString())}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ExplorePosts;
