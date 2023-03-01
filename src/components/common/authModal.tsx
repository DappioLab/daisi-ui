import { updateAuthModalData } from "@/redux/globalSlice";
import style from "@/styles/common/authModal.module.sass";
import { useDispatch } from "react-redux";

export interface IAuthModalProps {
  showAuthModal: boolean;
}

const AuthModal = () => {
  const dispatch = useDispatch();

  const closeModal = () => {
    const data: IAuthModalProps = {
      showAuthModal: false,
    };
    dispatch(updateAuthModalData(data));
  };

  return (
    <div className={style.authModal}>
      <div
        className={style.bg}
        onClick={() => {
          closeModal();
        }}
      ></div>
      <div className={style.modalContainer}></div>
    </div>
  );
};

export default AuthModal;
