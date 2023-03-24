import { IRootState } from "@/redux";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  like,
  fetchPosts,
  connectWallet,
  createCyberConnectClient,
  checkNetwork,
} from "./helper";
import CommentBox from "./commentBox";

export interface Post {
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
  comments: Post[];
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
    await checkNetwork(provider);
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

  const renderPostOrComment = (content: Post, level: number = 0) => {
    return (
      <div key={content.contentID}>
        {level == 0 ? (
          <h2>{content.title}</h2>
        ) : (
          <h2>{`Comment (${level}) - ` + content.title}</h2>
        )}

        <h2>
          by {content.authorHandle.split(".")[0]}
          {" - "}
          {moment(content.createdAt).format("MMMM DD,YYYY")}
        </h2>
        <h3>{content.body}</h3>
        {content.likeCount}
        <button
          onClick={() => {
            handleOnClick(content.contentID, true);
          }}
        >
          {content.likedStatus.liked ? "Liked" : "Like"}
        </button>
        {content.dislikeCount}
        <button
          onClick={() => {
            handleOnClick(content.contentID, false);
          }}
        >
          {content.likedStatus.disliked ? "Disliked" : "Dislike"}
        </button>
        <CommentBox
          contentId={content.contentID}
          address={myAddress}
          fetchData={fetchData}
        />
        {content.comments.length > 0 && (
          <div>
            {content.comments.map((comment) =>
              renderPostOrComment(comment, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {postList.map((post) => {
        return renderPostOrComment(post);
      })}
    </div>
  );
};

export default PostList;
