import { useEffect } from "react";
import API from "@/axios/api";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./BlockMigrated";
import {
  ConnectionInterface,
  ProfileAccount,
  ReactionInterface,
  ReplyInterface,
} from "./Explore";
import style from "@/styles/gumPage/postMigrated.module.sass";
import { PublicKey } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "./../../gpl-core/src";
import { ReactionType } from "../../gpl-core/src/reaction";
import { ipfsClient, mainGateway } from "./storage";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../redux/index";
import { IParsedRssData, IRssSourceItem } from "@/redux/dailySlice";
import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
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
  fetchPostData: () => Promise<void>;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  // const [reply, setReply] = useState("");
  // const [open, setOpen] = useState(false);
  const { userProfile, following, followers, reactions } = useSelector(
    (state: IRootState) => state.gum
  );
  const { userData, userProfilePageData } = useSelector(
    (state: IRootState) => state.global
  );
  const sdk = post.sdk;
  const [daisiContent, setDaisiContent] = useState<IParsedRssData | null>();

  useEffect(() => {
    // @ts-ignore
    const daisiContent = post.post.daisiContent;
    setDaisiContent({
      source: {
        id: "string",
        sourceTitle: "string",
        sourceDescription: "string",
        sourceLink: "string",
        sourceIcon: "https://picsum.photos/200/300",
        // "https://s1.1zoom.me/big3/471/Painting_Art_Back_view_Photographer_575380_3840x2400.jpg",
      },
      id: "",
      itemTitle: daisiContent.itemTitle,
      itemDescription: daisiContent.itemDescription,
      itemLink: daisiContent.itemLink,
      itemImage: daisiContent.itemImage,
      created: daisiContent.created,
      likes: [],
      forwards: [],
      sourceIcon: userProfilePageData.profilePicture,
      linkCreated: daisiContent.linkCreated,
    });
  }, [post]);

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
  const createGunFollow = async (profile: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let followIx = await (
        await sdk?.connection.create(
          userProfile.profile,
          new PublicKey(profile),
          userProfile.user,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
      return { success: false };
    }
    return { success: true };
  };
  const createGunLike = async (post: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await sdk?.reaction.create(
          userProfile.profile,
          new PublicKey(post),
          "Like",
          userProfile.user,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
      return { success: false };
    }
    return { success: true };
  };
  const handleFollow = async (e: any) => {
    try {
      let result = await createGunFollow(post.post.profile.toString());
      if (result.success && userData) {
        let followOnDb = await API.updateUserFollowData({
          id: userData.id,
          targetId: post.post.profile.toString(),
        });
        console.log(followOnDb);
      }
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
      console.log("like trigger");

      let result = await createGunLike(post.post.cl_pubkey.toString());
      console.log("k");

      if (result.success) {
        console.log("done");

        setTimeout(() => {
          post.fetchPostData();
        }, 3000);

        //   let likeOnDb = await API.updateRssItemLike(
        //     post.post.cl_pubkey.toString(),
        //     userData.id
        //   );
        //   console.log(likeOnDb);
      }

      // setTimeout(() => {
      //   console.log("in");

      // }, 10000);
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
      <div className={style.btn} onClick={handleLike}>
        <div style={{ fontSize: "1.6rem" }}>
          <i className="fa fa-heart-o"></i>
        </div>
      </div>
    );
    let disLikeButton = (
      <div className={style.btn} onClick={handleDislike}>
        Dislike
      </div>
    );
    let like = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("like");
    });
    let disLike = reactionsFromUser.find((reaction) => {
      return Object.keys(reaction.type).includes("dislike");
    });
    if (like) {
      likeButton = (
        <div
          className={style.btn}
          onClick={() => {
            deleteLike(like.cl_pubkey);
          }}
        >
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart" aria-hidden="true"></i>
          </div>{" "}
        </div>
      );
    }
    if (disLike) {
      disLikeButton = (
        <div
          className={style.btn}
          onClick={() => {
            deleteDislike(disLike.cl_pubkey);
          }}
        >
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart" aria-hidden="true"></i>
          </div>
        </div>
      );
    }
    reactionButton = (
      <>
        {likeButton}
        {/* {disLikeButton} */}
      </>
    );
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
      {/* <div className={style.profile}> */}
      {/* {"@" + post.post.profile.toString().slice(0, 10)} */}
      {/* {followButton} */}
      {/* </div> */}
      {daisiContent && (
        <HorizontalFeed
          article={daisiContent}
          type={EFeedType.GUM_ITEM}
          // setShowModal={() => {}}
        >
          <div className={style.btnBlock}>{reactionButton}</div>
        </HorizontalFeed>
      )}
      {/* <div className={style.reaction}>
        {"reactions: " + (postReaction ? postReaction.length : 0)}
      </div> */}
    </div>
  );
};

export default Post;
