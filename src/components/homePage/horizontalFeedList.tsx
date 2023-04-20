import style from "@/styles/homePage/horizontalFeedList.module.sass";
import { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import CyberConnectHorizontalPost from "../cyberConnect/cyberConnectHorizontalPost";
import GumHorizontalPost from "../gum/gumHorizontalPost";
import RssHorizontalPost from "../rss/rssHorizontalPost";

interface IFeedList {
  updateList: () => void;
}

const HorizontalFeedList = (props: IFeedList) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const dispatch = useDispatch();

  return (
    <div className={style.horizontalFeedList}>
      {feedList.map((item, index) => {
        return (
          <div
            style={{ marginTop: "2rem" }}
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            {item.type === EFeedType.RSS_ITEM && (
              <RssHorizontalPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.GUM_ITEM && (
              <GumHorizontalPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.CC_ITEM && (
              <CyberConnectHorizontalPost
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

export default HorizontalFeedList;
