import style from "@/styles/homePage/gridPostList.module.sass";
import RssGridPost from "../rss/rssGridPost";
import GumGridPost from "../gum/gumGridPost";
import CyberConnectGridPost from "../cyberConnect/cyberConnectGridPost";
import { EPostType } from "@/pages";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { IPostList } from "@/redux/discoverSlice";
import {
  EPostModalType,
  updatePostModalIndex,
  updatePostModalType,
  updateShowPostModal,
} from "@/redux/globalSlice";

interface IGridPostListProps {
  position: EPostModalType;
  list: IPostList[];
  updateList: () => void;
}

const GridPostList = (props: IGridPostListProps) => {
  const { postList } = useSelector(
    (state: IRootState) => state.persistedReducer.discover
  );
  const dispatch = useDispatch();

  return (
    <div className={style.gridPostList}>
      {postList.map((item, index) => {
        return (
          <div
            className={style.listItem}
            key={`${index}`}
            onClick={() => {
              dispatch(updatePostModalType(props.position));
              dispatch(updatePostModalIndex(index));
              dispatch(updateShowPostModal(true));
            }}
          >
            {item.type === EPostType.RSS_ITEM && (
              <RssGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EPostType.GUM_ITEM && (
              <GumGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EPostType.CC_ITEM && (
              <CyberConnectGridPost
                item={item.ccPost}
                updateList={props.updateList}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GridPostList;
