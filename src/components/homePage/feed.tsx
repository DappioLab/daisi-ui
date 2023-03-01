import style from "@/styles/homePage/feed.module.sass";
import moment from "moment";
import { updateCurrentId } from "@/redux/dailySlice";
import { Dispatch, SetStateAction, useState } from "react";
import { useDispatch } from "react-redux";

export interface IFeed {
  article: {
    node: {
      id: string;
      title: string;
      createdAt: string;
      readTime: string;
      image: string;
      source: {
        image: string;
      };
    };
  };
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
}

const Feed = (props: IFeed) => {
  const dispatch = useDispatch();
  const [showLinkButton, setShowLinkButton] = useState(false);

  const updateCurrentID = async (id: string) => {
    dispatch(updateCurrentId(id));
  };

  return (
    <div
      className={style.feed}
      onClick={(e) => {
        updateCurrentID(props.article.node.id);
        props.getPost(props.article.node.id);
        e.preventDefault();
      }}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div className={style.articleIcon}>
        <img src={props.article.node.source.image} alt="icon" />
      </div>
      {showLinkButton ? (
        <a
          href={`https://api.daily.dev/r/${props.article.node.id}`}
          target="_blank"
        >
          <div
            className={style.linkButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* @ts-ignore */}
            Read more <i className="fa fa-external-link" aria-hidden="true"></i>
          </div>
        </a>
      ) : null}

      <div className={style.title}>{props.article.node.title}</div>
      <div className={style.space}></div>
      <div className={style.timeBlock}>
        {moment(props.article.node.createdAt).format("MMMM DD,YYYY")} -{" "}
        {props.article.node.readTime}m read time
      </div>
      <div className={style.articleImage}>
        <img src={props.article.node.image} alt="icon" />
      </div>
    </div>
  );
};

export default Feed;
