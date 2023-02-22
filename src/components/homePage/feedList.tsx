import { endpoint, ANONYMOUS_FEED_QUERY } from "@/graphql/daily/query";
import style from "@/styles/homePage/feedList.module.sass";
import request from "graphql-request";
import { useEffect, useState } from "react";
import Feed, { IFeed } from "./feed";
import { useInView } from "react-intersection-observer";

const FeedList = () => {
  const [feedList, setFeedList] = useState<IFeed[]>([]);
  const [feedOptions, setFeedOptions] = useState({});
  const { ref, inView } = useInView({
    rootMargin: "50px",
  });

  const getData = async () => {
    const res = await request(endpoint, ANONYMOUS_FEED_QUERY, feedOptions);

    setFeedOptions({ after: res.page.pageInfo.endCursor });
    setFeedList((old) => {
      return [...old, ...res.page.edges];
    });
  };

  useEffect(() => {
    if (inView) {
      getData();
    }
  }, [inView]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div key={index} ref={ref}>
            <Feed article={item} />
          </div>
        );
      })}
    </div>
  );
};

export default FeedList;
