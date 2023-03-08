import style from "@/styles/homePage/feedModal.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateModalData } from "@/redux/dailySlice";

interface IFeedModal {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  postModalIndex: number;
  // getPost: (id: string) => Promise<void>;
  // getCurrentModalIndex: (index: number) => number;
  setPostModalIndex: Dispatch<SetStateAction<number | null>>;
}

const FeedModal = (props: IFeedModal) => {
  const { modalData, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const { screenWidth } = useSelector((state: IRootState) => state.global);
  const dispatch = useDispatch();
  const [disabledPrevBtn, setDisabledPrevBtn] = useState(false);

  // useEffect(() => {
  //   if (modalData) {
  //     props.setShowModal(true);
  //   }
  // }, [modalData]);

  const getAdjoiningPost = (value: number) => {
    props.setPostModalIndex(props.postModalIndex + value);
    // const currentIndex = props.getCurrentModalIndex();
    // const updatedIndex = currentIndex + value;
    // if (updatedIndex <= 0) {
    //   setDisabledPrevBtn(true);
    // } else {
    //   setDisabledPrevBtn(false);
    // }
    // if (updatedIndex < 0) {
    //   return;
    // }
    // // @ts-ignore
    // const targetPostId = feedList[updatedIndex].node.id;
    // const url = `/feed/${targetPostId}`;
    // history.replaceState({}, "", url);
    // props.getPost(targetPostId);
  };

  useEffect(() => {
    getAdjoiningPost(0);
  }, []);

  return (
    <div className={style.feedModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updateModalData(null));
          props.setShowModal(false);
        }}
      ></div>
      <div className={style.modalContainer}>
        <div className={style.btnBlock}>
          <div className={style.quickBtnBlock}>
            <div
              onClick={() => getAdjoiningPost(-1)}
              className={`${disabledPrevBtn && style.disabledBtn}`}
            >
              <i className="fa fa-arrow-left"></i>
            </div>
            <br />
            <div onClick={() => getAdjoiningPost(1)}>
              <i className="fa fa-arrow-right"></i>
            </div>
          </div>
          <a href={modalData.itemLink} target="_blank">
            <div
              className={style.linkButton}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {screenWidth > 1024 ? <div>Read more</div> : null}
              <i className="fa fa-external-link" aria-hidden="true"></i>
            </div>
          </a>
        </div>

        <h1>{modalData.itemTitle}</h1>
        {/* <div className={style.tagBlock}>
          {modalData.post.tags.map((tag: string) => {
            return (
              <div key={tag} className={style.tag}>
                #{tag}
              </div>
            );
          })}
        </div> */}
        <div className={style.timeBlock}>
          {moment(parseInt(modalData.linkCreated)).format("MMMM DD, YYYY")}
          {/* <span> -{modalData.post.readTime} read time</span> */}
        </div>
        <img
          src={`https://picsum.photos/200/300?${Math.random()}`}
          // src={modalData.itemImage}
          alt="cover"
          className={style.coverImage}
        />
        <div className={style.interactNumBlock}>
          <span> {modalData.likes.length} Upvotes</span>
          {/* <span>{modalData.post.numComments} Comments</span> */}
        </div>
      </div>
    </div>
  );
};

export default FeedModal;
