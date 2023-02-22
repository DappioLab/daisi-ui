import style from "@/styles/homePage/feed.module.sass";
import moment from "moment";
import Image from "next/image";

export interface IFeed {
  // titleIcon: string;
  // title: string;
  // date: string;
  // articleImage: string;
  article: any;
}

const Feed = (props: IFeed) => {
  return (
    <a
      href={`https://api.daily.dev/r/${props.article.node.permalink
        .split("/")
        .pop()}`}
      target="_blank"
    >
      <div className={style.feed}>
        <div className={style.articleIcon}>
          <img src={props.article.node.source.image} alt="icon" />
        </div>
        <div className={style.title}>{props.article.node.title}</div>
        <div className={style.test}></div>
        <div className={style.timeBlock}>
          {moment(props.article.node.createdAt).format("MMMM DD,YYYY")} -{" "}
          {props.article.node.readTime}m read time
        </div>
        <div className={style.articleImage}>
          <img src={props.article.node.image} alt="icon" />
        </div>
      </div>
    </a>
  );
};

export default Feed;
