import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./Block";
import { ProfileAccount } from "./Explore";
import style from "@/styles/gumPage/post.module.sass";
import { PublicKey } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "@gumhq/sdk";
import { ReactionType } from "@gumhq/sdk/src/reaction";

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
  userProfile: ProfileAccount;
  following: { follow: PublicKey; cl_pubkey: PublicKey }[];
  reactions?: { from: PublicKey; type: ReactionType; cl_pubkey: PublicKey }[];
  sdk: SDK | null;
  setData: Dispatch<SetStateAction<postInterface[]>>;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  let reactionsFromUser = [];
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
        return follow.follow.toString() == post.post.profile;
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
          new PublicKey(post.post.cl_pubkey),
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
          new PublicKey(post.post.cl_pubkey),
          "Like",
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteLike = async (e: any) => {
    try {
      let account = reactionsFromUser.find((reaction) => {
        return Object.keys(reaction.type).includes("like");
      }).cl_pubkey;
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteLikeTx = (
        await post.sdk?.reaction.delete(
          account,
          new PublicKey(post.post.cl_pubkey),
          post.userProfile.accountKey,
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  const deleteDislike = async (e: any) => {
    try {
      let account = reactionsFromUser.find((reaction) => {
        return Object.keys(reaction.type).includes("dislike");
      }).cl_pubkey;
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let deleteLikeTx = (
        await post.sdk?.reaction.delete(
          account,
          new PublicKey(post.post.cl_pubkey),
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
          new PublicKey(post.post.cl_pubkey),
          "Dislike",
          post.userProfile.userKey,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
    }
  };
  let followButton = null;
  if (
    post.userProfile &&
    post.userProfile.accountKey.toString() != post.post.profile &&
    !post.following.find((conn) => {
      return conn.follow.toString() == post.post.profile;
    })
  ) {
    followButton = (
      <button className={style.follow} onClick={handleFollow}>
        Follow
      </button>
    );
  } else if (
    post.userProfile &&
    post.userProfile.accountKey.toString() != post.post.profile &&
    post.following.find((conn) => {
      return conn.follow.toString() == post.post.profile;
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
    post.userProfile.accountKey.toString() == post.post.profile
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

    if (
      reactionsFromUser.find((reaction) => {
        return Object.keys(reaction.type).includes("like");
      })
    ) {
      likeButton = (
        <button className={""} onClick={deleteLike}>
          revoke Like
        </button>
      );
    }
    if (
      reactionsFromUser.find((reaction) => {
        return Object.keys(reaction.type).includes("dislike");
      })
    ) {
      disLikeButton = (
        <button className={""} onClick={deleteDislike}>
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
      <div className={style.reaction}>
        {"reactions: " + (post.reactions ? post.reactions.length : 0)}
      </div>
      {reactionButton}
      {deleteButton}
    </div>
  );
};
export default Post;
