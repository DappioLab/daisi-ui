import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";
import { useEffect } from "react";

const Global = () => {
  const { submitModalData, showAuthModal, isLoading } = useSelector(
    (state: IRootState) => state.global
  );

  useEffect(() => {
    console.log(isLoading, "isLoading");
  }, [isLoading]);
  return (
    <div className={style.global}>
      {submitModalData.showSubmitModal && (
        <SubmitModal
          title={submitModalData.title}
          description={submitModalData.description}
        />
      )}
      <div className={showAuthModal ? style.show : style.hidden}>
        <AuthModal />
      </div>
      {isLoading && <div className={style.loadingMask}>Loading</div>}
    </div>
  );
};

export default Global;
