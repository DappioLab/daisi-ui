import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";
import style from "@/styles/common/global.module.sass";

const Global = () => {
  const { submitModalData, showAuthModal } = useSelector(
    (state: IRootState) => state.global
  );

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
    </div>
  );
};

export default Global;
