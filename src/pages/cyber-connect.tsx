import PageTitle from "@/components/common/pageTitle";
import OffChainFeedList from "@/components/cyberConnectPage/arweaveFeedList";
import FeedList from "@/components/cyberConnectPage/EssenceList";
import OffChainPost from "@/components/cyberConnectPage/offChainPost";
import Post from "@/components/cyberConnectPage/post";
import Profile from "@/components/cyberConnectPage/profile";
import SigninBtn from "@/components/cyberConnectPage/signinBtn";
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

      {accessToken && address ? (
        <div>
          {/* <Profile /> */}
          {/* <Post /> */}
          <hr />
          <OffChainPost />
          <hr />
          <OffChainFeedList />
        </div>
      ) : (
        <></>
      )}

      {/* <FeedList /> */}
    </div>
  );
};

export default CyberConnect;
