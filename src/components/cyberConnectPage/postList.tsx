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
import { handleCreator } from "./helper/profile";

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
  likedStatus: {
    liked: boolean;
    disliked: boolean;
    proof: { arweaveTxHash: string | null };
  };
}

// This only stored on Arweave, didn't launch an Onchain event
export interface Post extends Content {
  comments: Content[];
}

const PostList = ({ address }: { address: string }) => {
  const { cyberConnectClient, address: myAddress } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const [postList, setPostList] = useState<Post[]>([]);
  const daisiHandle = handleCreator(address);

  const fetchData = async () => {
    try {
      // TODO: Replace query with all post schema
      const res = await request(cyberConnectEndpoint, POST_BY_ADDRESS_QUERY, {
        address,
        myAddress,
      });

      // @ts-ignore
      let posts = res.address.wallet.profiles.edges
        .map((e: any) => e.node)
        .reduce((prev: any, curr: any) => prev.concat(curr), [])
        .filter((n: any) => n.posts.edges.length > 0)
        .map((n: any) => n.posts.edges.map((e: any) => e.node))
        .reduce((prev: any, curr: any) => prev.concat(curr), []);

      // filter Daisi created Handle only
      posts = posts.filter(
        (post: Post) => post.authorHandle.split(".")[0] == daisiHandle
      );

      setPostList(posts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnClick = async (contentID: string, isLike: boolean) => {
    await like(contentID, cyberConnectClient, isLike);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {postList.map((post) => {
        return (
          <div>
            <h2>{post.title}</h2>{" "}
            <h2>
              by {post.authorHandle.split(".")[0]}
              {" - "}
              {moment(post.createdAt).format("MMMM DD,YYYY")}
            </h2>
            <h3>{post.body}</h3>
            {post.likeCount}
            <button
              onClick={() => {
                handleOnClick(post.contentID, true);
              }}
            >
              {post.likedStatus.liked ? "Liked" : "Like"}
            </button>
            {post.dislikeCount}
            <button
              onClick={() => {
                handleOnClick(post.contentID, false);
              }}
            >
              {post.likedStatus.disliked ? "Disliked" : "Dislike"}
            </button>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
