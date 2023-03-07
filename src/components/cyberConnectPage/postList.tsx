import {
  POST_BY_ADDRESS_QUERY,
  cyberConnectEndpoint,
} from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import request from "graphql-request";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { like } from "./helper/like";
import { useRouter } from "next/router";

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

const PostList = () => {
  const {
    cyberConnectClient,
    profile,
    address: myAddress,
  } = useSelector((state: IRootState) => state.cyberConnect);
  const [postList, setPostList] = useState<Post[]>([]);
  const router = useRouter();
  let address = router.query.address;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace query with all post schema
        const res = await request(cyberConnectEndpoint, POST_BY_ADDRESS_QUERY, {
          address: address ?? myAddress ?? "",
        });

        // @ts-ignore
        const feeds = res.address.wallet.profiles.edges
          .map((e: any) => e.node)
          .reduce((prev: any, curr: any) => prev.concat(curr), [])
          .filter((n: any) => n.posts.edges.length > 0)
          .map((n: any) => n.posts.edges.map((e: any) => e.node))
          .reduce((prev: any, curr: any) => prev.concat(curr), []);

        setPostList(feeds);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);
  return (
    <div>
      {postList.map((post) => {
        return (
          <div>
            <h2>{post.title}</h2>{" "}
            <h2>
              by {post.authorHandle.slice(0, -3)}
              {" - "}
              {moment(post.createdAt).format("MMMM DD,YYYY")}
            </h2>
            <h3>{post.body}</h3>
            {post.likeCount}
            <button
              onClick={() => {
                like(post.contentID, cyberConnectClient, true);
              }}
            >
              Like
            </button>
            {post.dislikeCount}
            <button
              onClick={() => {
                like(post.contentID, cyberConnectClient, true);
              }}
            >
              Dislike
            </button>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
