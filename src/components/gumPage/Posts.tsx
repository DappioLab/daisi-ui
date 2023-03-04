import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./Block";
import {
  ConnectionInterface,
  ProfileAccount,
  ReactionInterface,
  ReplyInterface,
} from "./Explore";
import style from "@/styles/gumPage/post.module.sass";
import { PublicKey } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "./../../gpl-core/src";
import { ReactionType } from "../../gpl-core/src/reaction";
import { ipfsClient, mainGateway } from "./storage";
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
  userProfile: ProfileAccount;
  following: ConnectionInterface[];
  reactions?: ReactionInterface[];
  sdk: SDK | null;
  replies?: ReplyInterface[];
  setData: Dispatch<SetStateAction<postInterface[]>>;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  let reactionsFromUser: {
    from: PublicKey;
    type: ReactionType;
    cl_pubkey: PublicKey;
  }[] = [];
  if (post.reactions) {
    reactionsFromUser = post.reactions.filter((reaction) => {
      if (post.userProfile)
        return reaction.from.equals(post.userProfile.accountKey);
    });
  }
  const handleFollow = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let followIx = await (
        await post.sdk?.connection.create(
          post.userProfile.accountKey,
          new PublicKey(post.post.profile),
          post.userProfile.userKey,
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
      let reactionPubkey = post.following.find((follow) => {
        return follow.follow.toString() == post.post.profile.toString();
      });
      let unFollowIx = await (
        await post.sdk?.connection.delete(
          reactionPubkey.cl_pubkey,
          post.userProfile.accountKey,
          new PublicKey(post.post.profile),
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.rpc();
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
          post.post.cl_pubkey,
          post.userProfile.accountKey,
          post.userProfile.userKey,
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
          post.userProfile.accountKey,
          post.post.cl_pubkey,
          "Like",
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteLike = async (account: PublicKey) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteLikeTx = (
        await post.sdk?.reaction.delete(
          account,
          post.post.cl_pubkey,
          post.userProfile.accountKey,
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.rpc();
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
        await post.sdk?.reaction.delete(
          account,
          post.post.cl_pubkey,
          post.userProfile.accountKey,
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.rpc();
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
          post.userProfile.accountKey,
          post.post.cl_pubkey,
          "Dislike",
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const handleReply = async (e: any) => {
    let data: any = {
      content: { content: reply },
      type: "text",
      authorship: {
        signature: "0",
        publicKey: "0",
      },
      contentDigest: "0",
      signatureEncoding: "base64",
      digestEncoding: "hex",
      parentDigest: "",
    };
    let replyUrl = await ipfsClient.add(JSON.stringify(data));
    let replyTx = await (
      await post.sdk.post.reply(
        post.post.cl_pubkey,
        mainGateway + replyUrl.path,
        post.userProfile.accountKey,
        post.userProfile.userKey,
        wallet.publicKey
      )
    ).instructionMethodBuilder.rpc();
    console.log(replyTx);
  };
  let followButton = null;
  if (
    post.userProfile &&
    post.userProfile.accountKey.toString() != post.post.profile.toString() &&
    !post.following.find((conn) => {
      return conn.follow.equals(post.post.profile);
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleFollow}>
        Follow
      </button>
    );
  } else if (
    post.userProfile &&
    post.userProfile.accountKey.toString() != post.post.profile.toString() &&
    post.following.find((conn) => {
      return conn.follow.equals(post.post.profile);
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleUnfollow}>
        Unfollow
      </button>
    );
  }
  let deleteButton = null;
  if (
    post.userProfile &&
    post.userProfile.accountKey.equals(post.post.profile)
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
  if (post.userProfile) {
    let likeButton = (
      <button className={""} onClick={handleLike}>
        Like
      </button>
    );
    let disLikeButton = (
      <button className={""} onClick={handleDislike}>
        Dislike
      </button>
    );
    let like = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("like");
    });
    let disLike = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("dislike");
    });
    if (like) {
      likeButton = (
        <button
          className={""}
          onClick={() => {
            deleteLike(like.cl_pubkey);
          }}
        >
          revoke Like
        </button>
      );
    }
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
    reactionButton = (
      <div>
        {likeButton}
        {disLikeButton}
      </div>
    );
  }
  let replyForm = null;
  if (open) {
    replyForm = (
      <div>
        <form>
          <textarea
            onChange={(e) => setReply(e.target.value)}
            itemType="text"
            placeholder="Reply"
            className={style.replyform}
          ></textarea>
        </form>
        <button onClick={handleReply}>Submit</button>
      </div>
    );
  }
  return (
    <div className={style.feed}>
      <div className={style.title}>
        {"@" + post.post.profile.toString().slice(0, 10)}
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
      <div className={style.reaction}>
        {"reactions: " + (post.reactions ? post.reactions.length : 0)}
      </div>
      {reactionButton}
      {post.replies && <p className={style.text}> Replies </p>}
      {post.replies &&
        post.replies.map((reply) => {
          return (
            <div key={reply.cl_pubkey.toString()} className={style.reply}>
              {reply.text}
            </div>
          );
        })}
      <div>
        <button
          onClick={() => {
            setOpen(open ? false : true);
          }}
        >
          Reply
        </button>
        {replyForm}
      </div>
      {deleteButton}
    </div>
  );
};
export default Post;
