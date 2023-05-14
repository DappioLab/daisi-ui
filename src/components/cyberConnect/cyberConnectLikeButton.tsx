import { Post } from "@/redux/cyberConnectSlice";
import style from "@/styles/cyberConnect/cyberConnectLikeButton.module.sass";
import {
  like,
  connectWallet,
  createCyberConnectClient,
  checkNetwork,
} from "@/utils/cyberConnect";

interface ICyberConnectLikeButtonProps {
  post: Post;
  updateCC: () => void;
}

const CyberConnectLikeButton = (props: ICyberConnectLikeButtonProps) => {
  const handleOnClick = async (contentID: string, isLike: boolean) => {
    const provider = await connectWallet();
    await checkNetwork(provider);
    const cyberConnectClient = createCyberConnectClient(provider);
    await like(contentID, cyberConnectClient, isLike);
    props.updateCC();
  };

  return (
    <div className={style.cyberConnectLikeButton}>
      {props.post.likedStatus.liked ? (
        <div
          className={style.icon}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick(props.post.contentID, false);
          }}
        >
          <i className="fa fa-heart " aria-hidden="true" />
        </div>
      ) : (
        <div
          className={style.icon}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick(props.post.contentID, true);
          }}
        >
          <i className="fa fa-heart-o" />
        </div>
      )}
      <div className={style.number}>{props.post.likeCount}</div>
    </div>
  );
};

export default CyberConnectLikeButton;
