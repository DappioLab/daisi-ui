import Post, { postInterface } from "./Posts";
import React, { useEffect, useState, useMemo } from "react";
import API from "@/axios/api";
import { connection, useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS, SDK } from "@/gpl-core/src";
import { ReactionType } from "@/gpl-core/src/reaction";
import axios from "axios";
import style from "@/styles/gumPage/explore.module.sass";
import { ipfsClient, mainGateway } from "./storage";
import { useDispatch, useSelector } from "react-redux";
import { PostList } from "./gumState";
import { IRootState } from "@/redux";

export const CREATED_IN_DAISI_TAG = "Created in Daisi";

const ExplorePosts = () => {
  const wallet = useWallet();
  const sdk = useGumSDK();
  const { userProfile, following, followers, userAccounts, allPosts } =
    useSelector((state: IRootState) => state.persistedReducer.gum);

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

  const createGumPost = async (postLink: string) => {
    let postId = "";
    let ipfsLink = "";

    try {
      let data: any = {
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
            new PublicKey(userProfile.profile),
            new PublicKey(userProfile.user),
            wallet.publicKey
          );

          if (postIx) {
            let result = await postIx.instructionMethodBuilder.rpc();
            console.log(result);
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
            new PublicKey(userProfile.profile),
            new PublicKey(userProfile.user),
            wallet.publicKey
          )
        ).instructionMethodBuilder.rpc();
        console.log(addProfileTx);
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

  useEffect(() => {}, [allPosts]);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      let result = await createGumPost(postLink);
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

  let form = null;

  if (userProfile) {
    form = (
      <form>
        <textarea
          onChange={(e) => setPostLink(e.target.value)}
          itemType="text"
          placeholder="Submit Link"
          className={style.post}
        ></textarea>

        {/* <input
          type="file"
          name="myImage"
          onChange={(event) => {
            if (event.target.files) {
              setImg(event.target.files[0]);
            }
          }}
        /> */}

        <button onClick={handleSubmit} className="">
          Post
        </button>
      </form>
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

  return (
    <div>
      <div>
        <button onClick={handleAirdrop}>Airdrop 1 Sol</button>
      </div>
      {userInfo}
      <div>{createProfileButton}</div>
      <div>
        <button
          onClick={() => {
            setProfileEdit(profileEdit ? false : true);
          }}
        >
          Edit Profile
        </button>
        {profileEdit && editProfile}
      </div>
      <div>{form}</div>
      <PostList></PostList>
    </div>
  );
};

export default ExplorePosts;
