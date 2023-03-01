import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import AuthModal from "./authModal";
import SubmitModal from "./submitModal";

const Global = () => {
  const { submitModalData, authModalData } = useSelector(
    (state: IRootState) => state.global
  );

  return (
    <div>
      {submitModalData.showSubmitModal && (
        <SubmitModal
          title={submitModalData.title}
          description={submitModalData.description}
        />
      )}
      {authModalData.showAuthModal && <AuthModal />}
    </div>
  );
};

export default Global;
