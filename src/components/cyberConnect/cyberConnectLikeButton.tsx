import { Post } from "./cyberConnectPostList";
import {
  like,
  fetchPosts,
  connectWallet,
  createCyberConnectClient,
  checkNetwork,
} from "@/utils/cyberConnect";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

interface ILikeButtonProps {
  post: Post;
  updateCC: () => void;
}

const LikeButton = (props: ILikeButtonProps) => {
  const handleOnClick = async (contentID: string, isLike: boolean) => {
    const provider = await connectWallet();
    await checkNetwork(provider);
    const cyberConnectClient = createCyberConnectClient(provider);
    await like(contentID, cyberConnectClient, isLike);
    props.updateCC();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {props.post.likedStatus.liked ? (
        <div
          style={{ fontSize: "1.6rem" }}
          onClick={() => {
            handleOnClick(props.post.contentID, false);
          }}
        >
          <i className="fa fa-heart " aria-hidden="true"></i>
        </div>
      ) : (
        <div
          style={{ fontSize: "1.6rem" }}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick(props.post.contentID, true);
          }}
        >
          <i className="fa fa-heart-o"></i>
        </div>
      )}
      <div
        style={{
          marginLeft: "1rem",
        }}
      >
        {props.post.likeCount}
      </div>
    </div>
  );
};

export default LikeButton;
