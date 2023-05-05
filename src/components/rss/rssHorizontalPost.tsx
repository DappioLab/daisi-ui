import useRss from "./useRss";
import style from "@/styles/rss/rssHorizontalPost.module.sass";
import BaseHorizontalPost from "../homePage/baseHorizontalPost";
import { useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { IPostProps } from "@/pages";

interface IRssHorizontalPostProps extends IPostProps {}

const RssHorizontalPost = (props: IRssHorizontalPostProps) => {
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { updateLike } = useRss();

  return (
    <BaseHorizontalPost item={props.item} updateList={props.updateList}>
      <div className={style.rssHorizontalPost}>
        {
          <div
            className={style.btnBlock}
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
            <div className={style.number}>{props.item.likes.length}</div>
          </div>
        }
      </div>
    </BaseHorizontalPost>
  );
};

export default RssHorizontalPost;
