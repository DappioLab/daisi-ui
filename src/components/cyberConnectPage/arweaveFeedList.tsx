import {
  POST_BY_ADDRESS_QUERY,
  cyberConnectEndpoint,
} from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import request from "graphql-request";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LikeDislikeBtn from "./likeDislikeBtn";

export interface Content {
  contentID: string;
  authorHandle: string;
  authorAddress: string;
  title: string;
  body: string;
  digest: string;
  arweaveTxHash: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
}

// This only stored on Arweave, didn't launch an Onchain event
export interface Post extends Content {
  comments: Content[];
}

const OffChainFeedList = () => {
  const { address } = useSelector((state: IRootState) => state.cyberConnect);
  const [feedList, setFeedList] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace query with all post schema

        const res = await request(cyberConnectEndpoint, POST_BY_ADDRESS_QUERY, {
          address,
        });

        const feeds = res.address.wallet.profiles.edges
          .map((e: any) => e.node)
          .reduce((prev: any, curr: any) => prev.concat(curr), [])
          .filter((n: any) => n.posts.edges.length > 0)
          .map((n: any) => n.posts.edges.map((e: any) => e.node))
          .reduce((prev: any, curr: any) => prev.concat(curr), []);

        setFeedList(feeds);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      {feedList.map((feed) => {
        return (
          <div>
            <h2>{feed.title}</h2>{" "}
            <h2>
              by {feed.authorHandle.slice(0, -3)}
              {" - "}
              {moment(feed.createdAt).format("MMMM DD,YYYY")}
            </h2>
            <h3>{feed.body}</h3>
            {feed.likeCount}
            <LikeDislikeBtn contendId={feed.contentID} isLike={true} />
            {feed.dislikeCount}
            <LikeDislikeBtn contendId={feed.contentID} isLike={false} />
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default OffChainFeedList;
