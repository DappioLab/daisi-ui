import PageTitle from "@/components/common/pageTitle";
import PostList from "@/components/cyberConnectPage/postList";
import FeedList from "@/components/cyberConnectPage/test/EssenceList";
import OffChainPost from "@/components/cyberConnectPage/test/offChainPost";
import Post from "@/components/cyberConnectPage/test/createEssensePost";
import Profile from "@/components/cyberConnectPage/test/profile";
import SigninBtn from "@/components/cyberConnectPage/test/signinBtn";
import { IRootState } from "@/redux";
import style from "@/styles/cyberConnectPage/index.module.sass";
import { useSelector } from "react-redux";

const CyberConnect = () => {
  const { address, accessToken, profile } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  return (
    <div className={style.cyberConnect}>
      <PageTitle title="Cyber Connect" />
      {address && (
        <div>
          <PostList address={address} />
        </div>
      )}
    </div>
  );
};

export default CyberConnect;
