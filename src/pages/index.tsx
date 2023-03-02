import style from "@/styles/homePage/index.module.sass";
import FeedList from "@/components/homePage/feedList";
import PageTitle from "@/components/common/pageTitle";
import FeedModal from "@/components/homePage/feedModal";
import request from "graphql-request";
import { useEffect, useState } from "react";
import {
  endpoint,
  POST_BY_ID_STATIC_FIELDS_QUERY,
} from "@/graphql/daily/query";
import { useDispatch, useSelector } from "react-redux";
import { updateModalData } from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import HorizontalFeed from "@/components/homePage/horizontalFeed";
import HorizontalFeedList from "@/components/homePage/horizontalFeedList";
import dynamic from "next/dynamic";
import { getRss } from "@/utils/rss";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const { currentId, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const dispatch = useDispatch();

  const getCurrentModalIndex = () => {
    return feedList.findIndex((item) => item.id === currentId);
  };

  const getPost = async (id: string) => {
    const postData = await request(endpoint, POST_BY_ID_STATIC_FIELDS_QUERY, {
      id,
    });

    dispatch(updateModalData(postData));
    setShowModal(true);
  };

  return (
    <div className={`pageContent ${style.homePage}`}>
      <div>
        <WalletMultiButtonDynamic />
      </div>
      <PageTitle title="Daily" />
      <HorizontalFeedList
        setShowModal={setShowModal}
        getPost={getPost}
        getCurrentModalIndex={getCurrentModalIndex}
      />
      {/* <FeedList
        setShowModal={setShowModal}
        getPost={getPost}
        getCurrentModalIndex={getCurrentModalIndex}
      /> */}
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
