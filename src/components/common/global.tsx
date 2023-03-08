import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import { updateScreenWidth } from "@/redux/globalSlice";
import { ReactNode, useEffect } from "react";

interface IGlobalProps {
  children: ReactNode;
}

const Global = (props: IGlobalProps) => {
  const dispatch = useDispatch();
  const {
    submitModalData,
    showAuthModal,
    isLoading,
    screenWidth,
    showSubmitModal,
  } = useSelector((state: IRootState) => state.global);

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
      {isLoading && <div className={style.loadingMask}>Loading</div>}
      <>{props.children}</>
    </div>
  );
};

export default Global;
