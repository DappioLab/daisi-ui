import { IRootState } from "@/redux";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  like,
  fetchPosts,
  connectWallet,
  createCyberConnectClient,
} from "./helper";

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
  const { address: myAddress, lastPostsUpdateTime } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [postList, setPostList] = useState<Post[]>([]);

  const fetchData = async () => {
    try {
      if (!(address && myAddress)) {
        return;
      }

      const posts = await fetchPosts(address, myAddress);
      setPostList(posts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnClick = async (contentID: string, isLike: boolean) => {
    const provider = await connectWallet();
    const cyberConnectClient = createCyberConnectClient(provider);
    await like(contentID, cyberConnectClient, isLike);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [myAddress, address, lastPostsUpdateTime]);

  return (
    <div>
      {postList.map((post) => {
        return (
          <div key={post.contentID}>
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
