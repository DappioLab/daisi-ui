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
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/index";
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
  sdk: SDK;
  setData: Dispatch<SetStateAction<postInterface[]>>;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const { userProfile, following, followers, reactions } = useSelector(
    (state: IRootState) => state.gum
  );
  const sdk = post.sdk;
  let reactionsFromUser: {
    from: PublicKey;
    type: ReactionType;
    cl_pubkey: PublicKey;
  }[] = [];
  let postReaction = reactions.get(post.post.cl_pubkey.toString());
  if (postReaction) {
    reactionsFromUser = postReaction.filter((reaction) => {
      if (userProfile) return reaction.from.equals(userProfile.profile);
    });
  }

  const handleFollow = async (e: any) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let followIx = await (
        await sdk?.connection.create(
          userProfile.profile,
          new PublicKey(post.post.profile),
          userProfile.user,
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
      let reactionPubkey = following.find((follow) => {
        return follow.follow.toString() == post.post.profile.toString();
      });
      let unFollowIx = await (
        await sdk?.connection.delete(
          reactionPubkey.cl_pubkey,
          userProfile.profile,
          new PublicKey(post.post.profile),
          userProfile.user,
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
      let deleteTx = await sdk?.post
        .delete(
          post.post.cl_pubkey,
          userProfile.profile,
          userProfile.user,
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
        await sdk?.reaction.create(
          userProfile.profile,
          post.post.cl_pubkey,
          "Like",
          userProfile.user,
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
        await sdk?.reaction.delete(
          account,
          post.post.cl_pubkey,
          userProfile.profile,
          userProfile.user,
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
        await sdk?.reaction.create(
          userProfile.profile,
          post.post.cl_pubkey,
          "Dislike",
          userProfile.user,
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
          userProfile.profile,
          userProfile.user,
          wallet.publicKey
        )
      )?.rpc();
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
      await sdk.post.reply(
        post.post.cl_pubkey,
        mainGateway + replyUrl.path,
        userProfile.profile,
        userProfile.user,
        wallet.publicKey
      )
    ).instructionMethodBuilder.rpc();
    console.log(replyTx);
  };
  let followButton = null;
  if (
    userProfile &&
    userProfile.profile.toString() != post.post.profile.toString() &&
    !following.find((conn) => {
      return conn.follow.equals(post.post.profile);
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleFollow}>
        Follow
      </button>
    );
  } else if (
    userProfile &&
    userProfile.profile.toString() != post.post.profile.toString() &&
    following.find((conn) => {
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
  if (userProfile && userProfile.profile.equals(post.post.profile)) {
    deleteButton = (
      <div>
        <button className={""} onClick={handleDelete}>
          Delete Post
        </button>
      </div>
    );
  }
  let reactionButton = null;
  if (userProfile) {
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
        {"reactions: " + (postReaction ? postReaction.length : 0)}
      </div>
      {reactionButton}

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
