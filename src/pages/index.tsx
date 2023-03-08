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
  const { feedList, modalData } = useSelector(
    (state: IRootState) => state.daily
  );
  const { screenWidth } = useSelector((state: IRootState) => state.global);
  const [searchIndex, setSearchIndex] = useState(0);
  const [postModalIndex, setPostModalIndex] = useState<number | null>(null);
  const dispatch = useDispatch();

  // const getCurrentModalIndex = (index: number) => {
  //   setPo
  // };

  // const getPost = async (id: string) => {
  //   const postData = await request(endpoint, POST_BY_ID_STATIC_FIELDS_QUERY, {
  //     id,
  //   });

  //   dispatch(updateModalData(postData));
  //   setShowModal(true);
  // };

  const getAnonymousList = async () => {
    let nextNumber = searchIndex + 1;
    setSearchIndex(nextNumber);
    const res = await API.getRssData();
    return res.data;
  };

  const updateList = async () => {
    dispatch(updateLoadingStatus(true));
    const res: IApiRssListResponse[] = await getAnonymousList();
    console.log(res, "res");

    // let parsedData: any = [];

    // res.map((source) => {
    //   source.items.map((item) => {
    //     const obj = { ...item, source: { ...source } };
    //     parsedData.push(obj);
    //   });
    // });
    // console.log(parsedData, "parsedData");

    // dispatch(updateFeedList(parsedData));

    dispatch(updateFeedList(res));
    dispatch(updateLoadingStatus(false));
  };

  useEffect(() => {
    updateList();
  }, []);

  useEffect(() => {
    const content = feedList.find((feed, index) => {
      if (index === postModalIndex) {
        return feed;
      }
    });

    dispatch(updateModalData(content));
  }, [postModalIndex]);

  useEffect(() => {
    if (modalData) {
      setShowModal(true);
    }
  }, [modalData]);

  useEffect(() => {
    if (!showModal) {
      setPostModalIndex(null);
    }
  }, [showModal]);
  return (
    <div className={`pageContent ${style.homePage}`}>
      {/* <PageTitle title="Daily" /> */}
      {screenWidth < 960 ? (
        <GridFeedList
          setShowModal={setShowModal}
          // getPost={getPost}
          // getCurrentModalIndex={getCurrentModalIndex}
          setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      ) : (
        <HorizontalFeedList
          setShowModal={setShowModal}
          // getPost={getPost}
          setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      )}
      {showModal ? (
        <FeedModal
          setShowModal={setShowModal}
          postModalIndex={postModalIndex}
          // getPost={getPost}
          setPostModalIndex={setPostModalIndex}
        />
      ) : null}
    </div>
  );
};

export default HomePage;
