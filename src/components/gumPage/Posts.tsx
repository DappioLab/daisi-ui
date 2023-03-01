import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./Block";
import { ProfileAccount } from "./Explore";
import style from "@/styles/gumPage/post.module.sass";
import { PublicKey } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@gumhq/sdk";

export interface postInterface {
  metadatauri: string;
  cl_pubkey: string;
  content: { blocks: BlockInterface[] };
  type: string;
  title: string;
  description: string;
  image_url: string;
  profile: string;
}

interface postState {
  post: postInterface;
  userProfile: ProfileAccount[];
  connections: PublicKey[];
  sdk: SDK | null;
  setData: Dispatch<SetStateAction<postInterface[]>>;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  const handleFollow = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let followIx = await (
        await post.sdk?.connection.create(
          post.userProfile[0].accountKey,
          new PublicKey(post.post.profile),
          post.userProfile[0].userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const handleUnfollow = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }

      let followIx = await (
        await post.sdk?.connection.create(
          post.userProfile[0].accountKey,
          new PublicKey(post.post.profile),
          post.userProfile[0].userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const handleDelete = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteTx = await post.sdk?.post
        .delete(
          new PublicKey(post.post.cl_pubkey),
          post.userProfile[0].accountKey,
          post.userProfile[0].userKey,
          wallet.publicKey
        )
        ?.rpc();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  const handleLike = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await post.sdk?.reaction.create(
          post.userProfile[0].accountKey,
          new PublicKey(post.post.cl_pubkey),
          "Like",
          post.userProfile[0].userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const handleDislike = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await post.sdk?.reaction.create(
          post.userProfile[0].accountKey,
          new PublicKey(post.post.cl_pubkey),
          "Dislike",
          post.userProfile[0].userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  let followButton = null;
  if (
    post.userProfile.length > 0 &&
    post.userProfile[0].accountKey.toString() != post.post.profile &&
    !post.connections.find((conn) => {
      return conn.toString() == post.post.profile;
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleFollow}>
        Follow
      </button>
    );
  } else if (
    post.userProfile.length > 0 &&
    post.userProfile[0].accountKey.toString() != post.post.profile &&
    post.connections.find((conn) => {
      return conn.toString() == post.post.profile;
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleFollow}>
        Unfollow
      </button>
    );
  }
  let deleteButton = null;
  if (
    post.userProfile.length > 0 &&
    post.userProfile[0].accountKey.toString() == post.post.profile
  ) {
    deleteButton = (
      <div>
        <button className={""} onClick={handleDelete}>
          Delete Post
        </button>
      </div>
    );
  }
  let reactionButton = null;
  if (post.userProfile.length > 0) {
    reactionButton = (
      <div>
        <button className={""} onClick={handleLike}>
          Like
        </button>
        <button className={""} onClick={handleDislike}>
          Dislike
        </button>
      </div>
    );
  }
  return (
    <div className={style.feed}>
      <div className={style.title}>
        {"@" + post.post.profile.slice(0, 10)}
        {followButton}
      </div>
      {post.post.content.blocks &&
        post.post.content.blocks.map((block: BlockInterface) => {
          return (
            <div key={block.id}>
              <Block block={block} />
            </div>
          );
        })}
      {reactionButton}
      {deleteButton}
    </div>
  );
};
export default Post;
