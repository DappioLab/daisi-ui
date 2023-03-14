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
  const { ref, inView } = useInView();
  const dispatch = useDispatch();

  useEffect(() => {
    if (inView) {
      props.updateList();
    }
  }, [inView]);

  // useEffect(() => {
  //   const currentIndex = props.getCurrentModalIndex();
  //   if (feedList.length - 10 < currentIndex) {
  //     getAnonymousList();
  //   }
  // }, [currentId]);

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div
            key={`${index}`}
            ref={ref}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            <GridFeed
              article={item}
              // setShowModal={props.setShowModal}
              type={
                item.id.length > 24 ? EFeedType.CC_ITEM : EFeedType.RSS_ITEM
              }
            >
              {}
            </GridFeed>
          </div>
        );
      })}
    </div>
  );
};

export default GridFeedList;
