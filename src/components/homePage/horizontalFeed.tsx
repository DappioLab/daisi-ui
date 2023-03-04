import { IRssSourceData, updateCurrentId } from "@/redux/dailySlice";
import style from "@/styles/homePage/horizontalFeed.module.sass";
import moment from "moment";
import { useState } from "react";
import { IFeedProps } from "./feed";

interface IHorizontalFeedProps extends IFeedProps {
  sourceData: IRssSourceData;
}

const HorizontalFeed = (props: IHorizontalFeedProps) => {
  const [showLinkButton, setShowLinkButton] = useState(false);

  return (
    <div
      className={style.horizontalFeed}
      // onClick={(e) => {
      //   updateCurrentId(props.article.id);
      //   props.getPost(props.article.id);
      //   e.preventDefault();
      // }}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div className={style.articleIcon}>
        {/* <img src={props.article.source.image} alt="icon" /> */}
        <img src={props.sourceData.sourceIcon} alt="icon" />
      </div>
      {showLinkButton ? (
        <a href={props.article.sourceLink} target="_blank">
          {/* <a href={`https://api.daily.dev/r/${props.article.id}`} target="_blank"> */}
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
        {/* <div className={style.title}>{props.article.title}</div> */}
        <div className={style.title}>{props.article.sourceTitle}</div>
        <div className={style.space}></div>
        <div className={style.timeBlock}>
          {moment(props.article.created).format("MMMM DD,YYYY")} -{" "}
          {/* {moment(props.article.createdAt).format("MMMM DD,YYYY")} -{" "} */}
          {/* {props.article.readTime}m read time */}
        </div>
      </div>
      <div className={style.articleImage}>
        {/* <img src={props.article.image} alt="icon" /> */}
        <img src={props.article.sourceImage} alt="icon" />
      </div>
    </div>
  );
};

export default HorizontalFeed;
