import request from "graphql-request";
import {
  cyberConnectEndpoint,
  PROFILES_WITH_POSTS_QUERY,
} from "@/graphql/cyberConnect/query";
import { IFeed } from "@/components/homePage/feed";

export interface ICyberConnectFeed {
  essenceID: string;
  symbol: string;
  tokenURI: string;
  metadata: {
    metadata_id: string;
    app_id: string;
    lang: string;
    issue_date: Date;
    content: string;
    image: string;
    name: string;
    description: string;
  };
  createdBy: IProfile;
}

export interface IProfile {
  profileID: number;
  handle: string;
  avatar: string;
  metadata: string;
}

export const getData = async () => {
  const res = await request(cyberConnectEndpoint, PROFILES_WITH_POSTS_QUERY);

  // @ts-ignore
  const profiles = res.profiles.edges.map((edge: any) => edge.node);
  let feeds = profiles
    .map((p: any) =>
      p.essences.edges
        .filter(
          (e: { node: ICyberConnectFeed }) =>
            e.node.symbol == "POST" && e.node.metadata != undefined
        )
        .map((e: { node: ICyberConnectFeed }) => e.node)
    )
    .reduce(
      (prev: any, curr: any) => prev.concat(curr),
      []
    ) as ICyberConnectFeed[];
  return feeds;
};

export const parseCyberConnectData = (raw: ICyberConnectFeed[]) => {
  const cyberConnectParsedData = raw.map((item) => {
    const obj: IFeed = {
      title: item.createdBy.handle,
      id: "",
      createdAt: "",
      readTime: "",
      image:
        item.metadata && item.metadata.image
          ? item.metadata.image
          : "/essence-placeholder.svg",
      source: {
        image: "",
      },
    };
    return obj;
  });
  return cyberConnectParsedData;
};
