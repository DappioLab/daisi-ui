import API from "@/axios/api";
import style from "@/styles/homePage/horizontalFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  IApiRssListResponse,
  IParsedRssData,
  IRssSourceData,
  updateFeedList,
} from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import { useWallet } from "@solana/wallet-adapter-react";

interface IFeedList {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
  getCurrentModalIndex: () => number;
}

const HorizontalFeedList = (props: IFeedList) => {
  // const wallet = useWallet();
  const { feedList } = useSelector((state: IRootState) => state.daily);
  // const { ref, inView } = useInView();
  const dispatch = useDispatch();

  const getAnonymousList = async () => {
    const res = await API.getRssData();
    return res.data;
  };

  // useEffect(() => {
  //   if (inView) {
  //     (async () => {
  //       const dailyData = await getAnonymousList();
  //       dispatch(updateFeedList([...feedList, ...dailyData]));
  //     })();
  //   }
  // }, [inView]);

  // useEffect(() => {
  //   const currentIndex = props.getCurrentModalIndex();
  //   if (feedList.length - 10 < currentIndex) {
  //     getAnonymousList();
  //   }
  // }, [currentId]);

  useEffect(() => {
    (async () => {
      const res: IApiRssListResponse[] = await getAnonymousList();

      let parsedData: any = [];
      res.map((source) => {
        source.items.map((item) => {
          const obj = { ...item, source: { ...source } };
          parsedData.push(obj);
        });
      });

      console.log(parsedData, "parsedData");

      dispatch(updateFeedList(parsedData));
    })();
  }, []);

  return (
    <div className={style.horizontalFeedList}>
      {feedList.map((item, index) => {
        return (
          <div key={`${index}`}>
            <HorizontalFeed
              article={item}
              setShowModal={props.setShowModal}
              type={EFeedType.RSS_ITEM}
            />
            t
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalFeedList;
