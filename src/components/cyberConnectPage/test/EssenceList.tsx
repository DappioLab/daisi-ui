import request from "graphql-request";
import {
  cyberConnectEndpoint,
  PROFILES_WITH_POSTS_QUERY,
} from "@/graphql/cyberConnect/query";
import { useEffect, useState } from "react";
import Feed, { IFeed } from "./essence";

const FeedList = () => {
  const [feedList, setFeedList] = useState<IFeed[]>([]);

  useEffect(() => {
    const getData = async () => {
      const res = await request(
        cyberConnectEndpoint,
        PROFILES_WITH_POSTS_QUERY
      );
      // @ts-ignore
      const profiles = res.profiles.edges.map((edge: any) => edge.node);
      let feeds = profiles
        .map((p: any) =>
          p.essences.edges
            .filter(
              (e: { node: IFeed }) =>
                e.node.symbol == "POST" && e.node.metadata != undefined
            )
            .map((e: { node: IFeed }) => e.node)
        )
        .reduce((prev: any, curr: any) => prev.concat(curr), []) as IFeed[];

      // TODO: sort by new created post, issue_date="" need to find new param for sorting
      // feeds = feeds.sort((a, b) =>
      //   a.metadata.issue_date > b.metadata.issue_date ? 1 : -1
      // );

      setFeedList(feeds);
    };

    getData();
  }, []);

  const renderFeeds = () => {
    return feedList.map((feed, index) => (
      <div key={index}>
        <Feed feed={feed} />
      </div>
    ));
  };

  return <div>{renderFeeds()}</div>;
};

export default FeedList;
