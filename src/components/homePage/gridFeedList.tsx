import style from "@/styles/homePage/gridFeedList.module.sass";
import { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IRootState } from "@/redux";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import RssGridPost from "../rss/rssGridPost";
import GumGridPost from "../gum/gumGridPost";
import CyberConnectGridPost from "../cyberConnect/cyberConnectGridPost";
import { IFeedList } from "@/redux/dailySlice";

interface IGridFeedListProps {
  updateList: () => void;
  position: EFeedModalType;
  list: IFeedList[];
}

const GridFeedList = (props: IGridFeedListProps) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const dispatch = useDispatch();

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div
            style={{ position: "relative", height: "100%" }}
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(props.position));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            {item.type === EFeedType.RSS_ITEM && (
              <RssGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.GUM_ITEM && (
              <GumGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.CC_ITEM && (
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

export default GridFeedList;
