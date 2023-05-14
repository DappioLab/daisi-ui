import BaseGridPost from "../homePage/baseGridPost";
import useRss from "./useRss";
import style from "@/styles/rss/rssGridPost.module.sass";
import { IPostProps } from "@/pages";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";

interface IRssGridPostProps extends IPostProps {}

const RssGridPost = (props: IRssGridPostProps) => {
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { updateLike } = useRss();

  return (
    <BaseGridPost item={props.item} updateList={props.updateList}>
      <div
        className={style.rssGridPost}
        onClick={(e) => {
          e.stopPropagation();
          updateLike(props.item.id);
        }}
      >
        {userData && props.item.likes.includes(userData.id) ? (
          <div className={style.icon}>
            <i className="fa fa-heart " aria-hidden="true" />
          </div>
        ) : (
          <div className={style.icon}>
            <i className="fa fa-heart-o" />
          </div>
        )}
        <div>{props.item.likes.length}</div>
      </div>
    </BaseGridPost>
  );
};

export default RssGridPost;
