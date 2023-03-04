import CyberConnect from "@cyberlab/cyberconnect-v2";
import { IRootState } from "@/redux";
import { useSelector } from "react-redux";

const FollowBtn = ({
  handle,
  isFollow,
}: {
  handle: string;
  isFollow: boolean;
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

      if (isFollow) {
        await cyberConnect.follow(handle);
      } else {
        await cyberConnect.unfollow(handle);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <button onClick={handleOnClick}>{isFollow ? "Follow" : "Unfollow"}</button>
  );
};

export default FollowBtn;
