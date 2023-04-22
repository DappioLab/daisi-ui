import {
  checkNetwork,
  connectWallet,
  createCyberConnectClient,
} from "@/utils/cyberConnect";

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
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);

      if (isLike) {
        const res = await cyberConnectClient.like(contendId);
      } else {
        const res = await cyberConnectClient.dislike(contendId);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={handleOnClick}>{isLike ? "Like" : "Dislike"}</button>;
};

export default likeDislikeBtn;
