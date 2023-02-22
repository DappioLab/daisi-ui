import request from "graphql-request";
import {
  cyberConnectEndpoint,
  POST_BY_ID_QUERY,
} from "@/graphql/cyberConnect/query";
import { useEffect, useState } from "react";
import { IFeed } from "./feed";

const FeedList = () => {
  const [feedList, setFeedList] = useState<IFeed[]>([]);
  const id = "b39cc6650e8697ff304af06135a785f6687dbee3ffd25e7d55c5e45cf04c9b1d";

  useEffect(() => {
    const getData = async () => {
      const res = await request(cyberConnectEndpoint, POST_BY_ID_QUERY, { id });
      console.log(res);
    };

    getData();
  }, []);

  return <div>feedList</div>;
};

export default FeedList;
