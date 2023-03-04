import CyberConnect from "@cyberlab/cyberconnect-v2";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";

const likeDislikeBtn = ({
  contendId,
  isLike,
}: {
  contendId: string;
  isLike: boolean;
}) => {
  const { provider } = useSelector((state: IRootState) => state.cyberConnect);

  const handleOnClick = async () => {
    try {
      const cyberConnect = new CyberConnect({
        namespace: "CyberConnect",
        env: "STAGING",
        provider: provider,
        signingMessageEntity: "CyberConnect",
      });

      if (isLike) {
        const res = await cyberConnect.like(contendId);
        console.log("like btn response:", res);
      } else {
        const res = await cyberConnect.dislike(contendId);
        console.log("dislike btn response:", res);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={handleOnClick}>{isLike ? "Like" : "Dislike"}</button>;
};

export default likeDislikeBtn;
