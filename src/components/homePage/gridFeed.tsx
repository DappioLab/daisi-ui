import { IParsedRssData, updateFeedList } from "@/redux/dailySlice";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "@/styles/homePage/gridFeed.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import API from "@/axios/api";

export enum EFeedType {
  USER_POST = "USER POST",
  RSS_ITEM = "RSS ITEM",
  CC_ITEM = "CC ITEM",
  GUM_ITEM = "GUM ITEM",
}

interface IGridFeedProps extends IFeedProps {
  type: EFeedType;
  children: ReactNode;
}

export interface IFeedProps {
  article: IParsedRssData;
  // setShowModal: Dispatch<SetStateAction<boolean>>;
  // getPost: (id: string) => Promise<void>;
}

const GridFeed = (props: IGridFeedProps) => {
  const dispatch = useDispatch();
  const [showLinkButton, setShowLinkButton] = useState(false);
  const { userData, isLogin } = useSelector(
    (state: IRootState) => state.global
  );
  const { feedList } = useSelector((state: IRootState) => state.daily);

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    if (props.type === EFeedType.USER_POST) {
      await API.updateUserPostLike(props.article.id, userData.id);
      window.location.reload();
    } else {
      const updatedItem = await API.updateRssItemLike(
        props.article.id,
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
    }
  };

  return (
    <div
      className={style.feed}
      onClick={(e) => {
        // updateCurrentID(props.article.id);
        // props.getPost(props.article.id);
        // e.preventDefault();
      }}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div className={style.articleIcon}>
        {props.type === EFeedType.CC_ITEM ? (
          <img
            src="https://yt3.googleusercontent.com/9BS6z4-q-tUFIt3c-amgoNv0QRrEBIMG992Q1lmwsoJTxTmOK6uREjemm0ebe-18VbPOZzVFtw=s900-c-k-c0x00ffffff-no-rj"
            alt="icon"
          />
        ) : (
          <img src={props.article.sourceIcon} alt="icon" />
        )}
      </div>
      {/* <div className={style.articleIcon}>
        <img src={props.article.sourceIcon} alt="icon" />
      </div> */}
      {showLinkButton ? (
        <a href={props.article.itemLink} target="_blank">
          <div
            className={style.linkButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Read more <i className="fa fa-external-link" aria-hidden="true"></i>
          </div>
        </a>
      ) : null}

      <div className={style.title}>{props.article.itemTitle}</div>
      <div className={style.space}></div>
      <div className={style.timeBlock}>
        {moment(props.article.created).format("MMMM DD,YYYY")}
      </div>
      <div className={style.articleImage}>
        <img
          src={`https://picsum.photos/200/300?${Math.random()}`}
          alt="icon"
        />
      </div>
      <div className={style.socialActionBlock}>{props.children}</div>
      {props.type === EFeedType.RSS_ITEM && (
        <div
          className={style.socialActionBlock}
          onClick={(e) => {
            e.stopPropagation();
            updateLike();
          }}
        >
          {userData && props.article.likes.includes(userData.id) ? (
            <div style={{ fontSize: "1.6rem" }}>
              <i className="fa fa-heart " aria-hidden="true"></i>
            </div>
          ) : (
            <div style={{ fontSize: "1.6rem" }}>
              <i className="fa fa-heart-o"></i>
            </div>
          )}
          <div className={style.actionNumber}>{props.article.likes.length}</div>
        </div>
      )}
    </div>
  );
};

export default GridFeed;
