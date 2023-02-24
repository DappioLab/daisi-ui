import style from "@/styles/homePage/feedModal.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import { updateCurrentId } from "@/redux/dailySlice";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

interface IFeedModal {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
  getCurrentModalIndex: () => number;
}

const FeedModal = (props: IFeedModal) => {
  const { modalData, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const dispatch = useDispatch();
  const [disabledPrevBtn, setDisabledPrevBtn] = useState(false);

  const getAdjoiningPost = (value: number) => {
    const currentIndex = props.getCurrentModalIndex();
    const updatedIndex = currentIndex + value;

    if (updatedIndex <= 0) {
      setDisabledPrevBtn(true);
    } else {
      setDisabledPrevBtn(false);
    }

    if (updatedIndex < 0) {
      return;
    }

    const targetPostId = feedList[updatedIndex].node.id;
    dispatch(updateCurrentId(targetPostId));

    const url = `/feed/${targetPostId}`;
    history.replaceState({}, "", url);
    props.getPost(targetPostId);
  };

  useEffect(() => {
    getAdjoiningPost(0);
  }, []);

  return (
    <div className={style.feedModal}>
      <div
        className={style.bg}
        onClick={() => {
          const url = `/`;
          history.replaceState({}, "", url);
          props.setShowModal(false);
        }}
      ></div>
      <div className={style.modalContainer}>
        <a
          href={`https://api.daily.dev/r/${modalData.post.id}`}
          target="_blank"
        >
          <div
            className={style.linkButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* @ts-ignore */}
            Read more <i class="fa fa-external-link" aria-hidden="true"></i>
          </div>
        </a>
        <div className={style.quickBtnBlock}>
          <div
            onClick={() => getAdjoiningPost(-1)}
            className={`${disabledPrevBtn && style.disabledBtn}`}
          >
            {/* @ts-ignore */}
            <i class="fa fa-arrow-left"></i>
          </div>
          <br />
          <div onClick={() => getAdjoiningPost(1)}>
            {/* @ts-ignore */}
            <i class="fa fa-arrow-right"></i>
          </div>
        </div>
        <h1>{modalData.post.title}</h1>
        <div className={style.tagBlock}>
          {modalData.post.tags.map((tag: string) => {
            return (
              <div key={tag} className={style.tag}>
                #{tag}
              </div>
            );
          })}
        </div>
        <div className={style.timeBlock}>
          {moment(modalData.post.createdAt).format("MMMM DD, YYYY")}
          <span> -{modalData.post.readTime} read time</span>
        </div>
        <img
          src={modalData.post.image}
          alt="cover"
          className={style.coverImage}
        />
        <div className={style.interactNumBlock}>
          <span> {modalData.post.numUpvotes} Upvotes</span>
          <span>{modalData.post.numComments} Comments</span>
        </div>
      </div>
    </div>
  );
};

export default FeedModal;
