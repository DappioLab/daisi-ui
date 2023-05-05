import style from "@/styles/homePage/horizontalPostList.module.sass";
import CyberConnectHorizontalPost from "../cyberConnect/cyberConnectHorizontalPost";
import GumHorizontalPost from "../gum/gumHorizontalPost";
import RssHorizontalPost from "../rss/rssHorizontalPost";
import { EPostType } from "@/pages";
import { useDispatch } from "react-redux";
import { IPostList } from "@/redux/discoverSlice";
import {
  EPostModalType,
  updatePostModalIndex,
  updatePostModalType,
  updateShowPostModal,
} from "@/redux/globalSlice";

interface IHorizontalPostListProps {
  list: IPostList[];
  position: EPostModalType;
  updateList: () => void;
}

const HorizontalPostList = (props: IHorizontalPostListProps) => {
  const dispatch = useDispatch();

  return (
    <div className={style.horizontalPostList}>
      {props.list && props.list.length > 0 ? (
        <>
          {props.list.map((item, index) => {
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
                  <RssHorizontalPost
                    item={item}
                    updateList={props.updateList}
                  />
                )}
                {item.type === EPostType.GUM_ITEM && (
                  <GumHorizontalPost
                    item={item}
                    updateList={props.updateList}
                  />
                )}
                {item.type === EPostType.CC_ITEM && (
                  <CyberConnectHorizontalPost
                    item={item.ccPost}
                    updateList={props.updateList}
                  />
                )}
              </div>
            );
          })}
        </>
      ) : null}
    </div>
  );
};

export default HorizontalPostList;
