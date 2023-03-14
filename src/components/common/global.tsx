import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import {
  EFeedModalType,
  updateFeedModalData,
  updateFeedModalIndex,
  updateFeedModalType,
  updateLoginStatus,
  updateScreenWidth,
  updateUserData,
} from "@/redux/globalSlice";
import { ReactNode, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import FeedModal from "../homePage/feedModal";
import { EFeedType } from "../homePage/horizontalFeed";
import { IFeedList } from "@/redux/dailySlice";
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
  } = useSelector((state: IRootState) => state.persistedReducer.global);

  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );

  const { postList } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  const { postList: gumList } = useSelector(
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

  return (
    <div className={style.global}>
      {showSubmitModal && <SubmitModal />}
      {showFeedModal && <FeedModal />}

      <div className={showAuthModal ? style.show : style.hidden}>
        <AuthModal />
      </div>
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
