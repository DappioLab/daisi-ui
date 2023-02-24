import style from "@/styles/homePage/index.module.sass";
import FeedList from "@/components/homePage/feedList";
import PageTitle from "@/components/common/pageTitle";
import FeedModal from "@/components/homePage/feedModal";
import request from "graphql-request";
import { useState } from "react";
import {
  endpoint,
  POST_BY_ID_STATIC_FIELDS_QUERY,
} from "@/graphql/daily/query";
import { useDispatch, useSelector } from "react-redux";
import { updateModalData } from "@/redux/dailySlice";
import { IRootState } from "@/redux";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const { currentId, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const dispatch = useDispatch();

  const getCurrentModalIndex = () => {
    return feedList.findIndex((item) => item.node.id === currentId);
  };

  const getPost = async (id: string) => {
    const postData = await request(endpoint, POST_BY_ID_STATIC_FIELDS_QUERY, {
      id,
    });

    dispatch(updateModalData(postData));
    setShowModal(true);
  };

  return (
    <div className={style.homePage}>
      <PageTitle title="Daily" />
      <FeedList
        setShowModal={setShowModal}
        getPost={getPost}
        getCurrentModalIndex={getCurrentModalIndex}
      />
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
