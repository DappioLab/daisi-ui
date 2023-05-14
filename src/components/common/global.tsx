import style from "@/styles/common/global.module.sass";
import PostModal from "../homePage/postModal";
import EventNotification from "./eventNotification";
import CommentListModal from "./commentListModal";
import dynamic from "next/dynamic";
import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  EPostModalType,
  updateCurrentCheckingCommentParentId,
  updatePostModalData,
  updatePostModalIndex,
  updatePostModalType,
  updateScreenWidth,
  updateShowCommentListModal,
} from "@/redux/globalSlice";
import { ReactNode, useEffect, useState } from "react";
import { EPostType } from "@/pages";
import { Post } from "@/redux/cyberConnectSlice";

const AuthModal = dynamic(() => import("./authModal"), { ssr: false });
const SubmitModal = dynamic(() => import("./submitModal"), { ssr: false });

interface IGlobalProps {
  children: ReactNode;
}

const Global = (props: IGlobalProps) => {
  const dispatch = useDispatch();
  const {
    showAuthModal,
    isLoading,
    screenWidth,
    showSubmitModal,
    showPostModal,
    postModalIndex,
    postModalType,
    showCommentListModal,
    currentCheckingCommentParentId,
    commentListType,
  } = useSelector((state: IRootState) => state.persistedReducer.global);

  const { postList: discoverPostList } = useSelector(
    (state: IRootState) => state.persistedReducer.discover
  );

  const { postList: cyberConnectPostList, commentMap: cyberConnectCommentMap } =
    useSelector((state: IRootState) => state.persistedReducer.cyberConnect);

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
    if (!postModalType || !showPostModal) {
      return;
    }

    switch (postModalType) {
      case EPostModalType.DISCOVER_ITEM:
        content = discoverPostList.find((post, index) => {
          if (index === postModalIndex) {
            const obj = JSON.parse(JSON.stringify(post));
            return obj;
          }
        });

        if (postModalIndex + 1 === discoverPostList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
      case EPostModalType.PROFILE_CC:
        content = cyberConnectPostList.find((post, index) => {
          if (index === postModalIndex) {
            const obj = JSON.parse(JSON.stringify(post));
            return obj;
          }
        });

        if (postModalIndex + 1 === cyberConnectPostList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
      case EPostModalType.PROFILE_GUM:
        content = gumList.find((post, index) => {
          if (index === postModalIndex) {
            const obj = JSON.parse(JSON.stringify(post));
            return obj;
          }
        });

        if (postModalIndex + 1 === gumList.length) {
          content = { ...content, isLastItem: true };
        }
        break;
        break;
      default:
        break;
    }

    dispatch(updatePostModalData(content));
  }, [postModalIndex, discoverPostList, cyberConnectPostList, postModalType]);

  useEffect(() => {
    if (!showPostModal) {
      dispatch(updatePostModalData(null));
      dispatch(updatePostModalIndex(null));
      dispatch(updatePostModalType(null));
    }
  }, [showPostModal]);

  const [list, setList] = useState<Post[]>([]);

  useEffect(() => {
    if (currentCheckingCommentParentId.length === 0) {
      return;
    } else {
      dispatch(updateShowCommentListModal(true));
    }

    let data = null;

    switch (commentListType) {
      case EPostType.CC_ITEM:
        console.log(cyberConnectCommentMap, "cyberConnectCommentMap");
        console.log(
          currentCheckingCommentParentId,
          "currentCheckingCommentParentId"
        );

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
      case EPostType.GUM_ITEM:
        data = gumCommentMap.get(
          currentCheckingCommentParentId[
            currentCheckingCommentParentId.length - 1
          ]
        );

        if (!data) {
          return;
        }

        data = data.map((item) => {
          return {
            body: item.text,
            comments: gumCommentMap.get(item.cl_pubkey.toString())
              ? gumCommentMap.get(item.cl_pubkey.toString())
              : [],
            contentId: item.cl_pubkey.toString(),
          };
        });
        break;
    }
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
      {showPostModal && <PostModal />}

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
