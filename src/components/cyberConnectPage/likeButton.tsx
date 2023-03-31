import { Post } from "./postList";
import {
  like,
  fetchPosts,
  connectWallet,
  createCyberConnectClient,
  checkNetwork,
} from "./helper";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";
import { useState } from "react";

interface ILikeButtonProps {
  post: Post;
  updateCC: () => void;
  // address: string;
}

const LikeButton = (props: ILikeButtonProps) => {
  // const { address: myAddress, lastPostsUpdateTime } = useSelector(
  //   (state: IRootState) => state.persistedReducer.cyberConnect
  // );
  const [postList, setPostList] = useState<Post[]>([]);

  const handleOnClick = async (contentID: string, isLike: boolean) => {
    alert("x");
    const provider = await connectWallet();
    await checkNetwork(provider);
    const cyberConnectClient = createCyberConnectClient(provider);
    await like(contentID, cyberConnectClient, isLike);
    props.updateCC();
    // await fetchData();
  };

  // const fetchData = async () => {
  //   try {
  //     if (!(props.address && myAddress)) {
  //       return;
  //     }

  //     const posts = await fetchPosts(props.address, myAddress);
  //     setPostList(posts);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

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
