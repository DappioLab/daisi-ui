import style from "@/styles/homePage/feedModal.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateFeedList } from "@/redux/dailySlice";
import API from "@/axios/api";
import {
  updateFeedModalData,
  updateFeedModalIndex,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import { EFeedType } from "./horizontalFeed";

interface IFeedModal {
  // setShowModal: Dispatch<SetStateAction<boolean>>;
  // postModalIndex: number;
  // getPost: (id: string) => Promise<void>;
  // getCurrentModalIndex: (index: number) => number;
  // setPostModalIndex: Dispatch<SetStateAction<number | null>>;
}

const FeedModal = (props: IFeedModal) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const { screenWidth, userData, isLogin, feedModalIndex, feedModalData } =
    useSelector((state: IRootState) => state.persistedReducer.global);
  const dispatch = useDispatch();
  const [disabledPrevBtn, setDisabledPrevBtn] = useState(false);

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    const updatedItem = await API.updateRssItemLike(
      feedModalData.id,
      userData.id
    );

    if (updatedItem) {
      const updatedList = feedList.map((item) => {
        if (item.id === updatedItem.data._id) {
          const obj = JSON.parse(JSON.stringify(item));
          obj.likes = updatedItem.data.likes;
          return obj;
        }
        return item;
      });
      dispatch(updateFeedList(updatedList));
    }
  };

  const getAdjoiningPost = (value: number) => {
    dispatch(updateFeedModalIndex(feedModalIndex + value));
  };

  return (
    <div className={style.feedModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updateFeedModalData(null));
          dispatch(updateShowFeedModal(false));
        }}
      ></div>
      <div className={style.modalContainer}>
        {feedModalData && (
          <>
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
              <a href={feedModalData.itemLink} target="_blank">
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

            <h1>{feedModalData.itemTitle}</h1>
            {feedModalData.type === EFeedType.CC_ITEM && (
              <div className={style.summaryBlock}>
                <span className={style.title}>TL;DR</span>
                <span>{feedModalData.itemDescription}</span>
              </div>
            )}
            {/* <div className={style.tagBlock}>
          {feedModalData.post.tags.map((tag: string) => {
            return (
              <div key={tag} className={style.tag}>
                #{tag}
              </div>
            );
          })}
        </div> */}
            <div className={style.timeBlock}>
              {moment(parseInt(feedModalData.linkCreated)).format(
                "MMMM DD, YYYY"
              )}
              {/* <span> -{feedModalData.post.readTime} read time</span> */}
            </div>
            <img
              src={`https://picsum.photos/200/300?${Math.random()}`}
              // src={feedModalData.itemImage}
              alt="cover"
              className={style.coverImage}
            />

            <div className={style.interactNumBlock}>
              <div
                className={style.socialActionBlock}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLike();
                }}
              >
                {userData && feedModalData.likes.includes(userData.id) ? (
                  <div style={{ fontSize: "1.6rem" }}>
                    <i className="fa fa-heart " aria-hidden="true"></i>
                  </div>
                ) : (
                  <div style={{ fontSize: "1.6rem" }}>
                    <i className="fa fa-heart-o"></i>
                  </div>
                )}
                <div className={style.actionNumber}>
                  {feedModalData.likes.length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedModal;
