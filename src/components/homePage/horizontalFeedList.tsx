import style from "@/styles/homePage/horizontalFeedList.module.sass";
import { EFeedType } from "./horizontalFeed";
import { useDispatch } from "react-redux";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import CyberConnectHorizontalPost from "../cyberConnect/cyberConnectHorizontalPost";
import GumHorizontalPost from "../gum/gumHorizontalPost";
import RssHorizontalPost from "../rss/rssHorizontalPost";
import { IFeedList } from "@/redux/dailySlice";

interface IHorizontalFeedListProps {
  list: IFeedList[];
  position: EFeedModalType;
  updateList: () => void;
}

const HorizontalFeedList = (props: IHorizontalFeedListProps) => {
  const dispatch = useDispatch();

  return (
    <div className={style.horizontalFeedList}>
      {props.list && props.list.length > 0 ? (
        <>
          {props.list.map((item, index) => {
            return (
              <div
                style={{ marginTop: "2rem" }}
                key={`${index}`}
                onClick={() => {
                  dispatch(updateFeedModalType(props.position));
                  dispatch(updateFeedModalIndex(index));
                  dispatch(updateShowFeedModal(true));
                }}
              >
                {item.type === EFeedType.RSS_ITEM && (
                  <RssHorizontalPost
                    item={item}
                    updateList={props.updateList}
                  />
                )}
                {item.type === EFeedType.GUM_ITEM && (
                  <GumHorizontalPost
                    item={item}
                    updateList={props.updateList}
                  />
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
        </>
      ) : null}
    </div>
  );
};

export default HorizontalFeedList;
