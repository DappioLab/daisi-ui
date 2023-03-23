import { useEffect } from "react";
import API from "@/axios/api";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./Block";
import {
  ConnectionInterface,
  ProfileAccount,
  ReactionInterface,
  ReplyInterface,
} from "./gumState";
import style from "@/styles/gumPage/post.module.sass";
import { PublicKey } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { ReactionType } from "@/gpl-core/src/reaction";
import { ipfsClient, mainGateway } from "./storage";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux/index";
import FollowButton from "./FollowButton";
import { useGumSDK } from "@/hooks/useGumSDK";
import LikeButton from "./LikeButton";
import Replylist from "./Replylist";
import DeleteButton from "./DeleteButton";
import ReplyForm from "./ReplyForm";
export interface postInterface {
  metadatauri: string;
  cl_pubkey: PublicKey;
  daisiContent: {
    itemTitle: string;
    itemDescription: string;
    itemLink: string;
    itemImage: string;
    created: Date;
  };
  content: { blocks: BlockInterface[] };
  type: string;
  title: string;
  description: string;
  image_url: string;
  profile: PublicKey;
}

interface postState {
  post: postInterface;
}

const Post = (post: postState) => {
  const wallet = useWallet();

  const { userProfile, following, followers, reactions, replyMap } =
    useSelector((state: IRootState) => state.persistedReducer.gum);
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const sdk = useGumSDK();
  let reactionsFromUser: ReactionInterface[] = [];
  let postReaction: ReactionInterface[] = [];
  if (reactions.size) {
    postReaction = reactions.get(post.post.cl_pubkey.toString());
    if (postReaction) {
      reactionsFromUser = postReaction.filter((reaction) => {
        if (userProfile)
          return reaction.from.toString() == userProfile.profile.toString();
      });
    }
  }

  const handleDislike = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await sdk?.reaction.create(
          new PublicKey(userProfile.profile),
          post.post.cl_pubkey,
          "Dislike",
          new PublicKey(userProfile.user),
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteDislike = async (account: PublicKey) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteLikeTx = (
        await sdk?.reaction.delete(
          account,
          post.post.cl_pubkey,
          new PublicKey(userProfile.profile),
          new PublicKey(userProfile.user),
          wallet.publicKey
        )
      )?.rpc();
    } catch (err) {
      console.log(err);
    }
  };

  let dislikeButton = null;
  if (userProfile) {
    let disLikeButton = (
      <button className={""} onClick={handleDislike}>
        Dislike
      </button>
    );

    let disLike = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("dislike");
    });

    if (disLike) {
      disLikeButton = (
        <button
          className={""}
          onClick={() => {
            deleteDislike(disLike.cl_pubkey);
          }}
        >
          revoke Dislike
        </button>
      );
    }
    dislikeButton = <div> {disLikeButton}</div>;
  }

  return (
    <div className={style.feed}>
      <div className={style.title}>
        {"@" + post.post.profile.toString().slice(0, 10)}
        <FollowButton toProfile={post.post.profile}></FollowButton>
      </div>
      {post.post.content.blocks &&
        post.post.content.blocks.map((block: BlockInterface) => {
          return (
            <div key={block.id}>
              <Block block={block} />
            </div>
          );
        })}
      <div className={style.reaction}>
        {"reactions: " + (postReaction ? postReaction.length : 0)}
      </div>
      <LikeButton toPost={post.post.cl_pubkey.toString()}></LikeButton>
      {dislikeButton}
      {replyMap.has(post.post.cl_pubkey.toString()) &&
        replyMap.get(post.post.cl_pubkey.toString()).length && (
          <p className={style.text}> Replies </p>
        )}
      <Replylist
        replies={replyMap.get(post.post.cl_pubkey.toString())}
        postPubkey={post.post.cl_pubkey.toString()}
      ></Replylist>
      <ReplyForm
        from={post.post.profile.toString()}
        post={post.post.cl_pubkey.toString()}
        type="Post"
      ></ReplyForm>
    </div>
  );
};
export default Post;
