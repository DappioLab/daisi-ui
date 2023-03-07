import { IParsedRssData } from "@/redux/dailySlice";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useDispatch } from "react-redux";
import style from "@/styles/homePage/gridFeed.module.sass";
import moment from "moment";

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
  setShowModal: Dispatch<SetStateAction<boolean>>;
  // getPost: (id: string) => Promise<void>;
}

const GridFeed = (props: IGridFeedProps) => {
  const dispatch = useDispatch();
  const [showLinkButton, setShowLinkButton] = useState(false);

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

      <div className={style.title}>{props.article.itemTitle}</div>
      <div className={style.space}></div>
      <div className={style.timeBlock}>
        {moment(props.article.created).format("MMMM DD,YYYY")}
      </div>
      <div className={style.articleImage}>
        {/* <img src={props.article.itemImage} alt="icon" /> */}
        <img
          src={`https://picsum.photos/200/300?${Math.random()}`}
          alt="icon"
        />
      </div>
    </div>
  );
};

export default GridFeed;
