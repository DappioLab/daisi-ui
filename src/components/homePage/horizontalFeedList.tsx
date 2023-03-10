import style from "@/styles/homePage/horizontalFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { IRootState } from "@/redux";

interface IFeedList {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setPostModalIndex: Dispatch<SetStateAction<number | null>>;
  // getPost: (id: string) => Promise<void>;
  // getCurrentModalIndex: (index: number) => number;
  updateList: () => void;
}

const HorizontalFeedList = (props: IFeedList) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  // const { ref, inView } = useInView();

  // useEffect(() => {
  //   if (inView) {
  //     props.updateList();
  //   }
  // }, [inView]);

  // useEffect(() => {
  //   const currentIndex = props.getCurrentModalIndex();
  //   if (feedList.length - 10 < currentIndex) {
  //     getAnonymousList();
  //   }
  // }, [currentId]);

  return (
    <div className={style.horizontalFeedList}>
      {feedList.map((item, index) => {
        return (
          <div
            key={`${index}`}
            onClick={() => {
              props.setPostModalIndex(index);
              // props.setShowModal(true);
            }}
          >
            <HorizontalFeed
              article={item}
              // setShowModal={props.setShowModal}
              type={
                item.id.length > 24 ? EFeedType.CC_ITEM : EFeedType.RSS_ITEM
              }
            >
              {}
            </HorizontalFeed>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalFeedList;
