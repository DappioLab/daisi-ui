import style from "@/styles/homePage/index.module.sass";
// import FeedList from "@/components/homePage/feedList";
import PageTitle from "@/components/common/pageTitle";
import FeedModal from "@/components/homePage/feedModal";
import request from "graphql-request";
import { useEffect, useState } from "react";
import {
  endpoint,
  POST_BY_ID_STATIC_FIELDS_QUERY,
} from "@/graphql/daily/query";
import { useDispatch, useSelector } from "react-redux";
import {
  IApiRssListResponse,
  updateFeedList,
  updateModalData,
} from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import HorizontalFeed from "@/components/homePage/horizontalFeed";
import HorizontalFeedList from "@/components/homePage/horizontalFeedList";
import GridFeedList from "@/components/homePage/gridFeedList";
import API from "@/axios/api";
import { updateLoadingStatus } from "@/redux/globalSlice";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const { feedList } = useSelector((state: IRootState) => state.daily);
  const { screenWidth } = useSelector((state: IRootState) => state.global);
  const [searchIndex, setSearchIndex] = useState(0);
  const dispatch = useDispatch();

  const getCurrentModalIndex = () => {
    return 0;
    // return feedList.findIndex((item) => item.id === currentId);
  };

  const getPost = async (id: string) => {
    const postData = await request(endpoint, POST_BY_ID_STATIC_FIELDS_QUERY, {
      id,
    });

    dispatch(updateModalData(postData));
    setShowModal(true);
  };

  const getAnonymousList = async () => {
    let nextNumber = searchIndex + 1;
    setSearchIndex(nextNumber);
    const res = await API.getRssData({ index: nextNumber });
    return res.data;
  };

  const updateList = async () => {
    const res: IApiRssListResponse[] = await getAnonymousList();

    let parsedData: any = [];
    res.map((source) => {
      source.items.map((item) => {
        const obj = { ...item, source: { ...source } };
        parsedData.push(obj);
      });
    });

    dispatch(updateFeedList([...feedList, ...parsedData]));
  };

  useEffect(() => {
    updateList();
  }, []);

  return (
    <div className={`pageContent ${style.homePage}`}>
      <PageTitle title="Daily" />
      {screenWidth < 960 ? (
        <GridFeedList
          setShowModal={setShowModal}
          getPost={getPost}
          getCurrentModalIndex={getCurrentModalIndex}
          updateList={updateList}
        />
      ) : (
        <HorizontalFeedList
          setShowModal={setShowModal}
          getPost={getPost}
          getCurrentModalIndex={getCurrentModalIndex}
          updateList={updateList}
        />
      )}
      {showModal ? (
        <FeedModal
          setShowModal={setShowModal}
          getPost={getPost}
          getCurrentModalIndex={getCurrentModalIndex}
        />
      ) : null}
    </div>
  );
};

export default HomePage;
