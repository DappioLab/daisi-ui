import { IPostProps } from "@/pages";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import GridFeed from "../homePage/gridFeed";
import useRss from "./useRss";

interface IRssGridFeedProps extends IPostProps {}

const RssGridPost = (props: IRssGridFeedProps) => {
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  const { updateLike } = useRss();

  return (
    <GridFeed item={props.item}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          updateLike(props.item.id);
        }}
      >
        {userData && props.item.likes.includes(userData.id) ? (
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart " aria-hidden="true"></i>
          </div>
        ) : (
          <div style={{ fontSize: "1.6rem" }}>
            <i className="fa fa-heart-o"></i>
          </div>
        )}
        <div>{props.item.likes.length}</div>
      </div>
    </GridFeed>
  );
};

export default RssGridPost;
