import { updateSubmitModalData } from "@/redux/globalSlice";
import style from "@/styles/common/submitModal.module.sass";
import { useDispatch } from "react-redux";

export interface ISubmitModalProps {
  title: string;
  description: string;
  showSubmitModal?: boolean;
}

export enum ESubmitModalTypes {
  submitLink = "Submit link",
  suggestNewSource = "Suggest new source",
}

const SubmitModal = (props: ISubmitModalProps) => {
  const dispatch = useDispatch();

  const closeModal = () => {
    const data: ISubmitModalProps = {
      title: "",
      description: "",
      showSubmitModal: false,
    };
    dispatch(updateSubmitModalData(data));
  };

  return (
    <div className={style.submitModal}>
      <div
        className={style.bg}
        onClick={() => {
          closeModal();
        }}
      ></div>
      <div className={style.modalContainer}>
        <div className={style.titleBlock}>
          <div className={style.title}>{props.title}</div>
          <div
            className={style.closeBtn}
            onClick={() => {
              closeModal();
            }}
          >
            x
          </div>
        </div>
        <div className={style.description}>{props.description}</div>
        <div className={style.inputBlock}>
          <input
            type="text"
            placeholder="Paste your link here."
            className={style.input}
          />
        </div>
        <div className={style.bottomBlock}>
          <div className={style.operateBtn}>Submit</div>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
