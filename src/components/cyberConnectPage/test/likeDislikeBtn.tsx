import { connectWallet, createCyberConnectClient } from "../helper";

const likeDislikeBtn = ({
  contendId,
  isLike,
}: {
  contendId: string;
  isLike: boolean;
}) => {
  const handleOnClick = async () => {
    try {
      const provider = await connectWallet();
      const cyberConnectClient = createCyberConnectClient(provider);

      if (isLike) {
        const res = await cyberConnectClient.like(contendId);
        console.log("like btn response:", res);
      } else {
        const res = await cyberConnectClient.dislike(contendId);
        console.log("dislike btn response:", res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={handleOnClick}>{isLike ? "Like" : "Dislike"}</button>;
};

export default likeDislikeBtn;
