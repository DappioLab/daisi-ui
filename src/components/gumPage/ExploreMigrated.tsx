import Post, { postInterface } from "./PostsMigrated";
import React, { useEffect, useState, useMemo } from "react";
import API from "@/axios/api";
import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS, SDK } from "../../gpl-core/src";
import { ReactionType } from "../../gpl-core/src/reaction";
import axios from "axios";
import style from "@/styles/gumPage/explore.module.sass";
import { ipfsClient, mainGateway } from "./storage";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserAccounts,
  updateUserProfile,
  updateFollowers,
  updateFollowing,
  updateReactions,
} from "../../redux/gumSlice";
import { IRootState } from "@/redux";
import { useRouter } from "next/router";
import { updateUserProfilePageHandle } from "@/redux/globalSlice";
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

interface IExplorePostsProps {
  checkingAddress: string;
}

const ExplorePosts = (props: IExplorePostsProps) => {
  const wallet = useWallet();
  const router = useRouter();
  const dispatch = useDispatch();
  const { userProfile, following, followers, userAccounts } = useSelector(
    (state: IRootState) => state.gum
  );
  const [explore, setExplore] = useState<postInterface[]>([]);
  const [postLink, setPostLink] = useState("");
  // const [postImg, setImg] = useState<File | null>(null);
  const [username, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [profileEdit, setProfileEdit] = useState(false);
  // parts for reply
  // const [replies, setReply] = useState<Map<string, ReplyInterface[]>>(
  //   new Map()
  // );
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );

  let sdk = useGumSDK(
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

      if (!userProfile && profileKeys && profileKeys.length > 0) {
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
      const address = router;
      let userKeys = await sdk?.user.getUserAccountsByUser(wallet.publicKey);
      if (userKeys && userKeys.length > 0) {
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
      // if (wallet.publicKey) {
      // const allPostAccounts =
      //   (await sdk?.post.getAllPosts()) as Array<PostAccount>;
      const address = props.checkingAddress;

      const allPostAccounts = [];
      // parts for reply
      // let replyMap = new Map<string, ReplyInterface[]>();
      const allPostLocal = await sdk.post.getPostAccountsByUser(
        new PublicKey(address)
        // wallet.publicKey
      );

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

      const data = [...userPostAccounts, ...allPostsMetadata]
        .filter((data) => {
          let postContext = data?.postData.data as postInterface;
          return (
            // @ts-ignore
            postContext.daisiContent &&
            // @ts-ignore
            postContext.daisiContent.itemImage.includes("https") &&
            data?.postData.status == 200 &&
            postContext.content.blocks?.find((block) => {
              return (
                block.type == "header" &&
                block.data.text == CREATED_IN_DAISI_TAG
              );
            })
          );
        })
        .map((data) => {
          let postContext = data?.postData.data as postInterface;
          return {
            ...postContext,
            metadatauri: data?.metadatauri,
            cl_pubkey: data ? data.cl_pubkey : PublicKey.default,
            profile: data ? data.profile : PublicKey.default,
          };
        });

      if (data.length > 0) {
        dispatch(updateUserProfilePageHandle(data[0].profile));
      }
      // @ts-ignore
      setExplore(data);
      fetchReaction();
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
      // }
    } catch (err) {
      console.log("error", err);
    }
  };
  const fetchConnections = async () => {
    try {
      if (wallet.publicKey && userProfile) {
        let following = await sdk?.connection.getALlConnectionAccounts(
          userProfile.profile
        );
        let followers = await sdk?.connection.getALlConnectionAccounts(
          undefined,
          userProfile.profile
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

  const createGumPost = async (postLink: string) => {
    let postId = "";
    let ipfsLink = "";

    try {
      let data: any = {
        daisiContent: {
          itemTitle: "test 1",
          itemDescription: "test 2",
          itemLink: "test 3",
          itemImage: "https://picsum.photos/200/300",
          // "https://www.online-image-editor.com/styles/2019/images/power_girl_editor.png",
          created: new Date(),
        },
        content: {
          blocks: [
            {
              id: "0",
              type: "header",
              data: { text: CREATED_IN_DAISI_TAG, level: 0 },
            },
            {
              id: "1",
              type: "header",
              data: { text: postLink, level: 3 },
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
      let uploadMetadata = await ipfsClient.add(JSON.stringify(data));

      ipfsLink = mainGateway + uploadMetadata.path;
      if (wallet.publicKey) {
        if (userProfile) {
          let postIx = await sdk?.post.create(
            ipfsLink,
            userProfile.profile,
            userProfile.user,
            wallet.publicKey
          );

          if (postIx) {
            let result = await postIx.instructionMethodBuilder.rpc();
            postId = postIx.postPDA.toString();
          }
        }
        return { success: true, postId, postLink: ipfsLink };
      } else {
        alert("Wallet Not connected");
      }
    } catch (err) {
      console.log(err);
      return { success: false, postId, postLink: ipfsLink };
    }
  };

  const uploadImage = async (imageFile: File) => {
    let uploadedPic = await ipfsClient.add(imageFile);
    return mainGateway + uploadedPic.path;
  };
  const createGumProfile = async (
    username: string,
    description: string,
    profilePicture?: string
  ) => {
    let data = {
      name: username,
      bio: description,
      username: username,
      avatar: profilePicture ? profilePicture : "",
    };
    try {
      let uploadMetadata = await ipfsClient.add(JSON.stringify(data));
      if (wallet.publicKey && userProfile) {
        let addProfileTx = await (
          await sdk.profileMetadata.create(
            mainGateway + uploadMetadata.path,
            userProfile.profile,
            userProfile.user,
            wallet.publicKey
          )
        ).instructionMethodBuilder.rpc();
        return { success: true };
      }
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  };
  const handleUpdateProfile = async (e: any) => {
    let imageLink = null;
    if (profileImg) {
      imageLink = await uploadImage(profileImg);
    }
    console.log(imageLink);
    let updateGum = await createGumProfile(username, description, imageLink);
    if (updateGum.success) {
      //Update user profile
    }
  };
  useEffect(() => {
    fetchProfile();
    fetchPostData();
    fetchConnections();
    fetchReaction();
  }, [wallet.connected, userProfile]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let result = await createGumPost(postLink);
      console.log(result, "result");

      if (result.success) {
        // Post to DB
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

      if (userAccounts.length > 0) {
        console.log("creating profile");
        let result = await (
          await sdk?.profile.create(
            userAccounts[0],
            "Personal",
            wallet.publicKey
          )
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
  if (wallet.connected && userAccounts.length <= 0) {
    createProfileButton = (
      <button onClick={handleCreateProfile} className="">
        Create User
      </button>
    );
  } else if (wallet.connected && !userProfile) {
    createProfileButton = (
      <button onClick={handleCreateProfile} className="">
        Create Profile
      </button>
    );
  }

  let userInfo = null;
  if (userProfile) {
    userInfo = (
      <div>
        <h1 className={style.handle}>{"@" + userProfile.profile.toString()}</h1>
        <p className={style.sub}>
          Following: {following.length} Follower: {followers.length}
        </p>
      </div>
    );
  }
  let editProfile = (
    <form>
      <textarea
        onChange={(e) => setUserName(e.target.value)}
        itemType="text"
        placeholder="Username"
        className={style.post}
      ></textarea>
      <textarea
        onChange={(e) => setDescription(e.target.value)}
        itemType="text"
        placeholder="Description"
        className={style.post}
      ></textarea>
      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          if (event.target.files) {
            setProfileImg(event.target.files[0]);
          }
        }}
      />

      <button onClick={handleUpdateProfile} className="">
        update
      </button>
    </form>
  );

  useEffect(() => {
    (async () => {
      await fetchPostData();
    })();
  }, [router.asPath]);

  return (
    <div>
      {explore?.map((post: postInterface) => {
        return (
          <div key={post.cl_pubkey.toString()} className="">
            <Post
              post={post}
              sdk={sdk}
              setData={setExplore}
              fetchPostData={fetchPostData}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ExplorePosts;
