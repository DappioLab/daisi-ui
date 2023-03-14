import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import {
  updateFeedModalData,
  updateFeedModalIndex,
  updateLoginStatus,
  updateScreenWidth,
  updateUserData,
} from "@/redux/globalSlice";
import { ReactNode, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import FeedModal from "../homePage/feedModal";
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
  } = useSelector((state: IRootState) => state.persistedReducer.global);

  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
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
    const content = feedList.find((feed, index) => {
      if (index === feedModalIndex) {
        return feed;
      }
    });
    dispatch(updateFeedModalData(content));
  }, [feedModalIndex, feedList]);

  useEffect(() => {
    if (!showFeedModal) {
      dispatch(updateFeedModalData(null));
      dispatch(updateFeedModalIndex(null));
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
