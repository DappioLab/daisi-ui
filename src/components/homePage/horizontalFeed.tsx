import API from "@/axios/api";
import { IRootState } from "@/redux";
import {
  IRssSourceData,
  IRssSourceItem,
  updateFeedList,
} from "@/redux/dailySlice";
import style from "@/styles/homePage/horizontalFeed.module.sass";
import moment from "moment";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IFeedProps } from "./feed";

interface IHorizontalFeedProps extends IFeedProps {
  // sourceData: IRssSourceData;
}

const HorizontalFeed = (props: IHorizontalFeedProps) => {
  const [showLinkButton, setShowLinkButton] = useState(false);
  const { userData, isLogin } = useSelector(
    (state: IRootState) => state.global
  );
  const { feedList } = useSelector((state: IRootState) => state.daily);
  const dispatch = useDispatch();

  const updateLike = async () => {
    if (!userData || !isLogin) {
      alert("Please login");
      return;
    }

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
  };

  return (
    <div
      className={style.horizontalFeed}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div className={style.articleIcon}>
        <img src={props.article.source.sourceIcon} alt="icon" />
      </div>
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
      <div className={style.titleBlock}>
        <div className={style.title}>{props.article.itemTitle}</div>
        <div className={style.space}></div>
        <div className={style.timeBlock}>
          {moment(props.article.created).format("MMMM DD,YYYY")} -{" "}
        </div>
        <br />
        <br />
        <div className={style.socialActionBlock} onClick={() => updateLike()}>
          {userData && props.article.likes.includes(userData.id) ? (
            <div style={{ fontSize: "2rem" }}>
              <i className="fa fa-heart " aria-hidden="true"></i>
            </div>
          ) : (
            <div style={{ fontSize: "2rem" }}>
              <i className="fa fa-heart-o"></i>
            </div>
          )}
          <div className={style.actionNumber}>{props.article.likes.length}</div>
        </div>
      </div>
      <div className={style.articleImage}>
        <img src={props.article.itemImage} alt="icon" />
      </div>
    </div>
  );
};

export default HorizontalFeed;
