import request from "graphql-request";
import {
  cyberConnectEndpoint,
  PROFILES_WITH_POSTS_QUERY,
} from "@/graphql/cyberConnect/query";
import { useEffect, useState } from "react";
import Feed, { IFeed } from "./feed";
import { Profile } from "./profile";

const FeedList = () => {
  const [profileList, setProfileList] = useState<Profile[]>([]);

  useEffect(() => {
    const getData = async () => {
      const res = await request(
        cyberConnectEndpoint,
        PROFILES_WITH_POSTS_QUERY
      );
      console.log(res);
      setProfileList(
        res.profiles.edges.map((edge: any) => ({
          profileID: edge.node.profileID,
          handle: edge.node.handle,
          avatarUrl: edge.node.avatarUrl,
          feeds: edge.node.essences
            ? edge.node.essences.edges
                .filter((e: { node: IFeed }) => e.node.symbol == "POST")
                .map((e: { node: IFeed }) => e.node)
            : [],
        }))
      );
    };

    getData();
  }, []);

  const renderProfiles = () => {
    return profileList
      .filter((p) => p.feeds.length > 0)
      .map((p: Profile, index) => {
        return (
          <div key={index}>
            {p.feeds.map((feed) => {
              console.log(feed);
              return <Feed feed={feed} handle={p.handle} />;
            })}
          </div>
        );
      });
  };

  return <div>{renderProfiles()}</div>;
};

export default FeedList;
