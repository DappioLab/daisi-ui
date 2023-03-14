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
import { IRootState } from "@/redux";
import { IFeedList, IParsedRssData, IRssSourceItem } from "@/redux/dailySlice";
import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
import GridFeed from "../homePage/gridFeed";
import {
  EFeedModalType,
  updateAuthModal,
  updateFeedModalIndex,
  updateFeedModalType,
  updateLoadingStatus,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import moment from "moment";
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
  postIndex: number;
}

const Post = (post: postState) => {
  const wallet = useWallet();
  const dispatch = useDispatch();
  // const [reply, setReply] = useState("");
  // const [open, setOpen] = useState(false);
  const { userProfile, following, followers, reactions } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const { userData, userProfilePageData, screenWidth } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const sdk = post.sdk;
  const [daisiContent, setDaisiContent] = useState<IFeedList | null>();

  useEffect(() => {
    // @ts-ignore
    const daisiContent = post.post.daisiContent;
    // console.log(daisiContent, "daisiContent");

    setDaisiContent({
      isUserPost: true,
      type: EFeedType.GUM_ITEM,
      sourceId: "",
      userAddress: "",
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
      if (userProfile)
        return reaction.from.toString() == userProfile.profile.toString();
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
  const handleLike = async () => {
    try {
      console.log("like trigger");
      dispatch(updateLoadingStatus(true));

      let result = await createGunLike(post.post.cl_pubkey.toString());

      if (result.success) {
        console.log("like update success");

        setTimeout(() => {
          dispatch(updateLoadingStatus(false));
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

  let reactionButton = null;
  if (userProfile) {
    let likeButton = (
      <div
        className={style.btn}
        onClick={(e) => {
          e.stopPropagation();
          handleLike();
        }}
      >
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
          onClick={(e) => {
            e.stopPropagation();
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
          onClick={(e) => {
            e.stopPropagation();
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

  const showLoginPrompt = () => {
    dispatch(updateAuthModal(true));
  };

  return (
    <div className={style.feed}>
      {daisiContent && (
        <>
          {screenWidth > 900 ? (
            <div
              onClick={() => {
                dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
                dispatch(updateFeedModalIndex(post.postIndex));
                dispatch(updateShowFeedModal(true));
              }}
            >
              <HorizontalFeed article={daisiContent} type={EFeedType.GUM_ITEM}>
                <div className={style.btnBlock}>
                  {reactionButton ? (
                    reactionButton
                  ) : (
                    <div
                      style={{ fontSize: "1.6rem" }}
                      onClick={(e) => {
                        showLoginPrompt();
                        e.stopPropagation();
                      }}
                    >
                      <i className="fa fa-heart-o"></i>
                    </div>
                  )}
                </div>
              </HorizontalFeed>
            </div>
          ) : (
            <div
              onClick={() => {
                dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
                dispatch(updateFeedModalIndex(post.postIndex));
                dispatch(updateShowFeedModal(true));
              }}
            >
              {" "}
              <GridFeed article={daisiContent} type={EFeedType.GUM_ITEM}>
                <div className={style.btnBlock}>
                  {reactionButton ? (
                    reactionButton
                  ) : (
                    <div
                      style={{ fontSize: "1.6rem" }}
                      onClick={(e) => {
                        showLoginPrompt();
                        e.stopPropagation();
                      }}
                    >
                      <i className="fa fa-heart-o"></i>
                    </div>
                  )}
                </div>
              </GridFeed>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Post;
