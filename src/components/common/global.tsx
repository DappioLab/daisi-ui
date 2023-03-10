import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import {
  updateLoginStatus,
  updateScreenWidth,
  updateUserData,
} from "@/redux/globalSlice";
import { ReactNode, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface IGlobalProps {
  children: ReactNode;
}

const Global = (props: IGlobalProps) => {
  const solanaWallet = useWallet();
  const dispatch = useDispatch();
  const { showAuthModal, isLoading, screenWidth, showSubmitModal } =
    useSelector((state: IRootState) => state.persistedReducer.global);
  const { provider } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
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

  // useEffect(() => {
  //   if (!provider && !solanaWallet.connected) {
  //     dispatch(updateLoginStatus(false));
  //     dispatch(updateUserData(null));
  //   }
  // }, [provider, solanaWallet]);

  return (
    <div className={style.global}>
      {showSubmitModal && (
        <SubmitModal
        // title={submitModalData.title}
        // description={submitModalData.description}
        // link={submitModalData.link}
        />
      )}
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
