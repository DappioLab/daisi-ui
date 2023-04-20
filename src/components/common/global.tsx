import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import {
  EFeedModalType,
  updateCurrentCheckingCommentParentId,
  updateFeedModalData,
  updateFeedModalIndex,
  updateFeedModalType,
  updateLoginStatus,
  updateScreenWidth,
  updateShowCommentListModal,
  updateUserData,
} from "@/redux/globalSlice";
import { ReactNode, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import FeedModal from "../homePage/feedModal";
import { EFeedType } from "../homePage/horizontalFeed";
import { IFeedList } from "@/redux/dailySlice";
import EventNotification from "./eventNotification";
import CommentListModal from "./commentListModal";
import { Post } from "../cyberConnect/cyberConnectPostList";
// import { updateModalData } from "@/redux/dailySlice";

interface IGlobalProps {
  children: ReactNode;
}

const Global = (props: IGlobalProps) => {
  const solanaWallet = useWallet();
  const dispatch = useDispatch();
  const {
    showAuthModal,
    isLoading,
    screenWidth,
    showSubmitModal,
    showFeedModal,
    feedModalIndex,
    feedModalData,
    feedModalType,
    showCommentListModal,
    currentCheckingCommentParentId,
    commentListType,
  } = useSelector((state: IRootState) => state.persistedReducer.global);

  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );

  const { postList, commentMap: cyberConnectCommentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  const { postList: gumList, commentMap: gumCommentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const resize = () => {
    let width = window.innerWidth;

    if (width === screenWidth) {
      return;
    }
    dispatch(updateScreenWidth(width));
  };

  useEffect(() => {
    window.addEventListener("resize", resize);
  }, [screenWidth]);

  useEffect(() => {
    resize();
  }, []);

  useEffect(() => {
    let content = null;
    if (!feedModalType || !showFeedModal) {
      return;
    }

    switch (feedModalType) {
      case EFeedModalType.DISCOVER_ITEM:
        content = feedList.find((feed, index) => {
          if (index === feedModalIndex) {
            const obj = JSON.parse(JSON.stringify(feed));
            return obj;
          }
        });

        if (feedModalIndex + 1 === feedList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
      case EFeedModalType.PROFILE_CC:
        content = postList.find((feed, index) => {
          if (index === feedModalIndex) {
            const obj = JSON.parse(JSON.stringify(feed));
            return obj;
          }
        });

        if (feedModalIndex + 1 === postList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
      case EFeedModalType.PROFILE_GUM:
        content = gumList.find((feed, index) => {
          if (index === feedModalIndex) {
            const obj = JSON.parse(JSON.stringify(feed));
            return obj;
          }
        });

        if (feedModalIndex + 1 === gumList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
        break;
      default:
        break;
    }

    dispatch(updateFeedModalData(content));
  }, [feedModalIndex, feedList, postList, feedModalType]);

  useEffect(() => {
    if (!showFeedModal) {
      dispatch(updateFeedModalData(null));
      dispatch(updateFeedModalIndex(null));
      dispatch(updateFeedModalType(null));
    }
  }, [showFeedModal]);

  const [list, setList] = useState<Post[]>([]);

  useEffect(() => {
    if (currentCheckingCommentParentId.length === 0) {
      return;
    } else {
      dispatch(updateShowCommentListModal(true));
    }

    let data = null;

    switch (commentListType) {
      case EFeedType.CC_ITEM:
        data =
          cyberConnectCommentMap[
            currentCheckingCommentParentId[
              currentCheckingCommentParentId.length - 1
            ]
          ];
        if (!data) {
          return;
        }
        break;
      case EFeedType.GUM_ITEM:
        data = gumCommentMap.get(
          currentCheckingCommentParentId[
            currentCheckingCommentParentId.length - 1
          ]
        );

        if (!data) {
          return;
        }

        console.log(data, "data");

        data = data.map((item) => {
          console.log(
            gumCommentMap.get(item.cl_pubkey.toString()),
            "gumCommentMap.get(item.cl_pubkey)"
          );

          return {
            body: item.text,
            // comments: [],
            comments: gumCommentMap.get(item.cl_pubkey.toString())
              ? gumCommentMap.get(item.cl_pubkey.toString())
              : [],
            contentID: item.cl_pubkey.toString(),
          };
        });
        break;
    }

    console.log(data, "////");

    setList(data);
  }, [currentCheckingCommentParentId]);

  useEffect(() => {
    if (!showCommentListModal) {
      dispatch(updateCurrentCheckingCommentParentId([]));
    }
  }, [showCommentListModal]);

  return (
    <div className={style.global}>
      {showSubmitModal && <SubmitModal />}
      {showFeedModal && <FeedModal />}

      <div className={showAuthModal ? style.show : style.hidden}>
        <AuthModal />
      </div>
      <EventNotification />
      {showCommentListModal && <CommentListModal list={list} />}

      {isLoading && (
        <div className={style.loadingMask}>
          <img className={style.loadingIcon} src="/loading.png" alt="" />
        </div>
      )}
      <>{props.children}</>
    </div>
  );
};

export default Global;
