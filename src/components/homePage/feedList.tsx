import style from "@/styles/homePage/feedList.module.sass";
import request from "graphql-request";
import Feed from "./feed";
import { endpoint, ANONYMOUS_FEED_QUERY } from "@/graphql/daily/query";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { updateFeedList } from "@/redux/dailySlice";
import { IRootState } from "@/redux";

interface IFeedList {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
  getCurrentModalIndex: () => number;
}

const FeedList = (props: IFeedList) => {
  const [feedOptions, setFeedOptions] = useState({});
  const { currentId, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const { ref, inView } = useInView();
  const dispatch = useDispatch();

  const getAnonymousList = async () => {
    const res = await request(endpoint, ANONYMOUS_FEED_QUERY, feedOptions);

    setFeedOptions({ after: res.page.pageInfo.endCursor });
    dispatch(updateFeedList([...feedList, ...res.page.edges]));
  };

  useEffect(() => {
    if (inView) {
      getAnonymousList();
    }
  }, [inView]);

  useEffect(() => {
    getAnonymousList();
  }, []);

  useEffect(() => {
    const currentIndex = props.getCurrentModalIndex();
    if (feedList.length - 10 < currentIndex) {
      getAnonymousList();
    }
  }, [currentId]);

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div key={index} ref={ref}>
            <Feed
              article={item}
              setShowModal={props.setShowModal}
              getPost={props.getPost}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FeedList;
