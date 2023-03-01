import PageTitle from "@/components/common/pageTitle";
import FeedList from "@/components/cyberConnectPage/feedList";
import Post from "@/components/cyberConnectPage/post";
import SigninBtn from "@/components/cyberConnectPage/signinBtn";
import style from "@/styles/cyberConnectPage/index.module.sass";

const CyberConnect = () => {
  return (
    <div className={style.cyberConnect}>
      <PageTitle title="Cyber Connect" />
      <SigninBtn />
      <Post />
      <hr />
      <FeedList />
    </div>
  );
};

export default CyberConnect;
