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
export interface postInterface {
  metadatauri: string;
  cl_pubkey: PublicKey;
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
  // const [reply, setReply] = useState("");
  // const [open, setOpen] = useState(false);
  const { userProfile, following, followers, reactions } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
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

  const handleDelete = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteTx = await sdk?.post
        .delete(
          post.post.cl_pubkey,
          new PublicKey(userProfile.profile),
          new PublicKey(userProfile.user),
          wallet.publicKey
        )
        ?.rpc();
      window.location.reload();
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
  // const handleReply = async (e: any) => {
  //   let data: any = {
  //     content: { content: reply },
  //     type: "text",
  //     authorship: {
  //       signature: "0",
  //       publicKey: "0",
  //     },
  //     contentDigest: "0",
  //     signatureEncoding: "base64",
  //     digestEncoding: "hex",
  //     parentDigest: "",
  //   };
  //   let replyUrl = await ipfsClient.add(JSON.stringify(data));
  //   let replyTx = await (
  //     await sdk.post.reply(
  //       post.post.cl_pubkey,
  //       mainGateway + replyUrl.path,
  //       userProfile.profile,
  //       userProfile.user,
  //       wallet.publicKey
  //     )
  //   ).instructionMethodBuilder.rpc();
  //   console.log(replyTx);
  // };

  let deleteButton = null;
  if (
    userProfile &&
    userProfile.profile.toString() == post.post.profile.toString()
  ) {
    deleteButton = (
      <div>
        <button className={""} onClick={handleDelete}>
          Delete Post
        </button>
      </div>
    );
  }
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
  let replyForm = null;
  // if (open) {
  //   replyForm = (
  //     <div>
  //       <form>
  //         <textarea
  //           onChange={(e) => setReply(e.target.value)}
  //           itemType="text"
  //           placeholder="Reply"
  //           className={style.replyform}
  //         ></textarea>
  //       </form>
  //       <button onClick={handleReply}>Submit</button>
  //     </div>
  //   );
  // }
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
      {
        // parts for reply
        /* 
      {post.replies && <p className={style.text}> Replies </p>}
      {post.replies &&
        post.replies.map((reply) => {
          return (
            <div key={reply.cl_pubkey.toString()} className={style.reply}>
              {reply.text}
            </div>
          );
        })} */
      }
      {/* <div>
        <button
          onClick={() => {
            setOpen(open ? false : true);
          }}
        >
          Reply
        </button>
        {replyForm}
      </div> */}
      {deleteButton}
    </div>
  );
};
export default Post;
