import style from "@/styles/homePage/feedModal.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IFeedList, updateFeedList } from "@/redux/dailySlice";
import API from "@/axios/api";
import {
  updateAuthModal,
  updateFeedModalData,
  updateFeedModalIndex,
  updateLoadingStatus,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import { EFeedType } from "./horizontalFeed";
import {
  like,
  fetchPostById,
  connectWallet,
  createCyberConnectClient,
} from "@/utils/cyberConnect";
import { setPostList } from "@/redux/cyberConnectSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import { SDK } from "./../../gpl-core/src";
import { useGumSDK } from "@/hooks/useGumSDK";
import { Connection, PublicKey } from "@solana/web3.js";
import { GRAPHQL_ENDPOINTS } from "@gumhq/sdk";

// interface IFeedModal {
// setShowModal: Dispatch<SetStateAction<boolean>>;
// postModalIndex: number;
// getPost: (id: string) => Promise<void>;
// getCurrentModalIndex: (index: number) => number;
// setPostModalIndex: Dispatch<SetStateAction<number | null>>;
// }

const FeedModal = () => {
  // const { feedList } = useSelector(
  //   (state: IRootState) => state.persistedReducer.daily
  // );
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );

  const { userProfile, following, followers, userAccounts } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  let sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );
  const { screenWidth, feedModalIndex, feedModalData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const dispatch = useDispatch();
  const { userData, isLogin, feedList, address, postList } = useSelector(
    (state: IRootState) => {
      return {
        userData: state.persistedReducer.global.userData,
        isLogin: state.persistedReducer.global.isLogin,
        feedList: state.persistedReducer.daily.feedList,
        address: state.persistedReducer.cyberConnect.address,
        postList: state.persistedReducer.cyberConnect.postList,
      };
    }
  );
  const wallet = useWallet();

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    dispatch(updateLoadingStatus(true));
    switch (feedModalData.type) {
      case EFeedType.RSS_ITEM:
        const updatedItem = await API.updateRssItemLike(
          feedModalData.id,
          userData.id
        );

        if (updatedItem) {
          const updatedList = feedList.map((item) => {
            if (item.id === updatedItem.data._id) {
              const obj = JSON.parse(JSON.stringify(item));
              obj.likes = updatedItem.data.likes;
              return obj;
            }
            return item;
          });
          dispatch(updateFeedList(updatedList));
        }
        break;

      case EFeedType.CC_ITEM:
        try {
          if (!address) {
            dispatch(updateAuthModal(true));
            return;
          }
          if (!feedModalData.id) {
            dispatch(updateAuthModal(true));
            return;
          }
          const isLiked = feedModalData.likes.includes(userData.id);

          const provider = await connectWallet();
          const cyberConnectClient = createCyberConnectClient(provider);
          await like(feedModalData.id, cyberConnectClient, !isLiked);

          const updatedPost = await fetchPostById(feedModalData.id, address);

          if (updatedPost) {
            const post: IFeedList = {
              type: EFeedType.CC_ITEM,
              created: new Date(updatedPost.createdAt).getTime().toString(),
              isUserPost: true,
              userAddress: feedModalData.userAddress,
              sourceIcon: feedModalData.sourceIcon,
              sourceId: updatedPost.contentID,
              itemTitle: updatedPost.title,
              itemDescription: updatedPost.body.split("\n\n")[0],
              itemImage: "",
              itemLink: updatedPost.body.split("\n\n").reverse()[0],
              likes: updatedPost.likedStatus.liked
                ? new Array(updatedPost.likeCount).fill(userData.id)
                : new Array(updatedPost.likeCount).fill("123"),
              forwards: [],
              linkCreated: new Date(updatedPost.createdAt).getTime().toString(),
              id: updatedPost.contentID,
            };

            const updatedList = feedList.map((feed) => {
              if (feed.id === updatedPost.contentID) {
                return post;
              }
              return feed;
            });
            const updatedCCPosts = postList.map((p) => {
              if (p.id === updatedPost.contentID) {
                return post;
              }
              return p;
            });
            dispatch(setPostList(updatedCCPosts));
            dispatch(updateFeedList(updatedList));
          }
        } catch (err) {
          console.log(err);
        }
        break;

      case EFeedType.GUM_ITEM:
        handleLike();
        break;
      case EFeedType.USER_POST:
        // Deprecate
        await API.updateUserPostLike(feedModalData.id, userData.id);
        window.location.reload();
        break;

      default:
        throw "ERROR: unknown feed type";
    }
    dispatch(updateLoadingStatus(false));
  };

  const handleLike = async () => {
    try {
      dispatch(updateLoadingStatus(true));

      let result = await createGumLike(feedModalData.cl_pubkey.toString());

      if (result.success) {
        console.log("like update success");

        setTimeout(() => {
          dispatch(updateLoadingStatus(false));
          window.location.reload();
        }, 5000);

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

  const createGumLike = async (post: string) => {
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

  // const updateLike = async () => {
  //   if (!userData?.id || !isLogin) {
  //     alert("Please login");
  //     return;
  //   }

  //   const updatedItem = await API.updateRssItemLike(
  //     feedModalData.id,
  //     userData.id
  //   );

  //   if (updatedItem) {
  //     const updatedList = feedList.map((item) => {
  //       if (item.id === updatedItem.data._id) {
  //         const obj = JSON.parse(JSON.stringify(item));
  //         obj.likes = updatedItem.data.likes;
  //         return obj;
  //       }
  //       return item;
  //     });
  //     dispatch(updateFeedList(updatedList));
  //   }
  // };

  const getAdjoiningPost = (value: number) => {
    const nextNumber = feedModalIndex + value;
    if (nextNumber < 0) {
      return;
    }
    dispatch(updateFeedModalIndex(feedModalIndex + value));
  };

  return (
    <div className={style.feedModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updateFeedModalData(null));
          dispatch(updateShowFeedModal(false));
        }}
      ></div>
      <div className={style.modalContainer}>
        {feedModalData && (
          <>
            <div className={style.btnBlock}>
              <div className={style.quickBtnBlock}>
                <div
                  onClick={() => getAdjoiningPost(-1)}
                  className={`${feedModalIndex === 0 && style.disabledBtn}`}
                >
                  <i className="fa fa-arrow-left"></i>
                </div>
                <br />
                <div
                  onClick={() => getAdjoiningPost(1)}
                  className={`${feedModalData.isLastItem && style.disabledBtn}`}
                >
                  <i className="fa fa-arrow-right"></i>
                </div>
              </div>
              <a href={feedModalData.itemLink} target="_blank">
                <div
                  className={style.linkButton}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {screenWidth > 1024 ? <div>Read more</div> : null}
                  <i className="fa fa-external-link" aria-hidden="true"></i>
                </div>
              </a>
            </div>

            <h1>{feedModalData.itemTitle}</h1>
            {feedModalData.itemDescription !== "" && (
              <div className={style.summaryBlock}>
                <div className={style.title}>TL;DR</div>
                <div>
                  {feedModalData.itemDescription.split("- ").map((item) => {
                    return <div>• {item}</div>;
                  })}
                </div>
              </div>
            )}
            {/* <div className={style.tagBlock}>
          {feedModalData.post.tags.map((tag: string) => {
            return (
              <div key={tag} className={style.tag}>
                #{tag}
              </div>
            );
          })}
        </div> */}
            <div className={style.timeBlock}>
              {moment(parseInt(feedModalData.linkCreated)).format(
                "MMMM DD, YYYY"
              )}
              {/* <span> -{feedModalData.post.readTime} read time</span> */}
            </div>
            <img
              src={
                feedModalData.itemImage && feedModalData.itemImage != ""
                  ? feedModalData.itemImage
                  : `https://picsum.photos/200/300?${Math.random()}`
              }
              // src={feedModalData.itemImage}
              alt="cover"
              className={style.coverImage}
            />

            <div className={style.interactNumBlock}>
              <div
                className={style.socialActionBlock}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLike();
                }}
              >
                {userData && feedModalData.likes.includes(userData.id) ? (
                  <div style={{ fontSize: "1.6rem" }}>
                    <i className="fa fa-heart " aria-hidden="true"></i>
                  </div>
                ) : (
                  <div style={{ fontSize: "1.6rem" }}>
                    <i className="fa fa-heart-o"></i>
                  </div>
                )}
                <div className={style.actionNumber}>
                  {feedModalData.likes.length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedModal;
