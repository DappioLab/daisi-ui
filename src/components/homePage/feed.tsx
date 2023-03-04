import style from "@/styles/homePage/feed.module.sass";
import moment from "moment";
import { IRssSourceItem, updateCurrentId } from "@/redux/dailySlice";
import { Dispatch, SetStateAction, useState } from "react";
import { useDispatch } from "react-redux";

export interface IFeed {
  profile?: string; // this field exists in GUM
  id: string;
  title: string;
  createdAt: string;
  readTime: string;
  image: string;
  source: {
    image: string;
  };
}

// export interface IFeedProps {
//   article: IFeed;
//   setShowModal: Dispatch<SetStateAction<boolean>>;
//   getPost: (id: string) => Promise<void>;
// }

export interface IFeedProps {
  article: IRssSourceItem;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
}

const Feed = (props: IFeedProps) => {
  const dispatch = useDispatch();
  const [showLinkButton, setShowLinkButton] = useState(false);

  const updateCurrentID = async (id: string) => {
    dispatch(updateCurrentId(id));
  };

  return (
    <div>hello world</div>
    // <div
    //   className={style.feed}
    //   onClick={(e) => {
    //     updateCurrentID(props.article.id);
    //     props.getPost(props.article.id);
    //     e.preventDefault();
    //   }}
    //   onMouseEnter={() => setShowLinkButton(true)}
    //   onMouseLeave={() => setShowLinkButton(false)}
    // >
    //   <div className={style.articleIcon}>
    //     <img src={props.article.source.image} alt="icon" />
    //   </div>
    //   {showLinkButton ? (
    //     <a href={`https://api.daily.dev/r/${props.article.id}`} target="_blank">
    //       <div
    //         className={style.linkButton}
    //         onClick={(e) => {
    //           e.stopPropagation();
    //         }}
    //       >
    //         Read more <i className="fa fa-external-link" aria-hidden="true"></i>
    //       </div>
    //     </a>
    //   ) : null}

    //   <div className={style.title}>{props.article.title}</div>
    //   <div className={style.space}></div>
    //   <div className={style.timeBlock}>
    //     {moment(props.article.createdAt).format("MMMM DD,YYYY")} -{" "}
    //     {props.article.readTime}m read time
    //   </div>
    //   <div className={style.articleImage}>
    //     <img src={props.article.image} alt="icon" />
    //   </div>
    // </div>
  );
};

export default Feed;
