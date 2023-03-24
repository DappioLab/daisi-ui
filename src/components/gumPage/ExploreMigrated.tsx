import Post, { postInterface } from "./PostsMigrated";
// import PostOriginal from "./Posts";
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
import { updatePostList } from "@/redux/gumSlice";
import { IRootState } from "@/redux";
import { useRouter } from "next/router";
import {
  updateLoadingStatus,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import { IFeedList } from "@/redux/dailySlice";
import { EFeedType } from "../homePage/horizontalFeed";
import moment from "moment";
import useGumState from "./gumState";

export const CREATED_IN_DAISI_TAG = "Created in Daisi";

interface IExplorePostsProps {
  checkingAddress: string;
}

const ExplorePosts = (props: IExplorePostsProps) => {
  const wallet = useWallet();
  const router = useRouter();
  useGumState();
  const dispatch = useDispatch();
  //dispatch(updateLoadingStatus(false));
  const { userProfile, following, followers, userAccounts } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const [explore, setExplore] = useState<postInterface[]>([]);
  const [postLink, setPostLink] = useState("");
  // const [postImg, setImg] = useState<File | null>(null);
  const [username, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImg, setProfileImg] = useState<File | null>(null);

  const { userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
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

  const fetchPostData = async () => {
    try {
      // if (wallet.publicKey) {
      // const allPostAccounts =
      //   (await sdk?.post.getAllPosts()) as Array<PostAccount>;
      const address = props.checkingAddress;

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

      const data = [...userPostAccounts]
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

      const sortedData = data
        .map((item) => {
          return {
            ...item,
            // @ts-ignore
            created: item.daisiContent.created,
          };
        })
        .sort((a, b) =>
          a.created < b.created ? 1 : a.created > b.created ? -1 : 0
        );
      setExplore(sortedData);

      let parsedPostList = [];

      for (let item of data) {
        // @ts-ignore
        const daisiContent = item.daisiContent;

        const obj: IFeedList = {
          isUserPost: true,
          type: EFeedType.GUM_ITEM,
          sourceId: "",
          userAddress: address,
          id: "",
          itemTitle: daisiContent.itemTitle,
          itemDescription: daisiContent.itemDescription,
          itemLink: daisiContent.itemLink,
          itemImage: daisiContent.itemImage,
          created: moment(daisiContent.created).valueOf().toString(),
          likes: [],
          forwards: [],
          sourceIcon: userProfilePageData.profilePicture,
          linkCreated: moment(daisiContent.created).valueOf().toString(),
          // @ts-ignore
          cl_pubkey: item.cl_pubkey,
        };
        parsedPostList.push(obj);
      }

      // // @ts-ignore
      // setExplore(data);

      // const parsedPostList = data.map((post) => {
      //   // @ts-ignore
      //   const daisiContent = post.post.daisiContent;
      //   const obj: IFeedList = {
      //     isUserPost: true,
      //     type: EFeedType.GUM_ITEM,
      //     sourceId: "",
      //     userAddress: address,
      //     id: "",
      //     itemTitle: daisiContent.itemTitle,
      //     itemDescription: daisiContent.itemDescription,
      //     itemLink: daisiContent.itemLink,
      //     itemImage: daisiContent.itemImage,
      //     created: daisiContent.created,
      //     likes: [],
      //     forwards: [],
      //     sourceIcon: userProfilePageData.profilePicture,
      //     linkCreated: daisiContent.linkCreated,
      //   };
      //   return obj;
      // });

      dispatch(updatePostList(parsedPostList));

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
    fetchPostData();
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
      } else {
        console.log("creating user");

        let user = await sdk?.user.create(wallet.publicKey);

        let result = await user?.instructionMethodBuilder.rpc();

        console.log(result);
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
      {explore?.map((post: postInterface, index: number) => {
        return (
          <div key={post.cl_pubkey.toString()}>
            <Post post={post} fetchPostData={fetchPostData} postIndex={index} />
            {/* <PostOriginal post={post} /> */}
          </div>
        );
      })}
    </div>
  );
};

export default ExplorePosts;
