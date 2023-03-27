import style from "@/styles/homePage/gridFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { IRootState } from "@/redux";
import GridFeed from "./gridFeed";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import GumLikeButton from "./gumLikeButton";

interface IFeedList {
  // setShowModal: Dispatch<SetStateAction<boolean>>;
  // getPost: (id: string) => Promise<void>;
  // getCurrentModalIndex: (index: number) => number;
  // setPostModalIndex: Dispatch<SetStateAction<number | null>>;
  updateList: () => void;
}

const GridFeedList = (props: IFeedList) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const dispatch = useDispatch();

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            <GridFeed article={item} type={item.type}>
              {item.type === EFeedType.GUM_ITEM && (
                <div className={style.btnBlock}>
                  <GumLikeButton
                    post={item.gumPost}
                    updateList={props.updateList}
                  />
                </div>
              )}
            </GridFeed>
          </div>
        );
      })}
    </div>
  );
};

export default GridFeedList;
