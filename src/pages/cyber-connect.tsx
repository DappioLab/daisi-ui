import PageTitle from "@/components/common/pageTitle";
import FeedList from "@/components/cyberConnectPage/feedList";
import style from "@/styles/cyberConnectPage/index.module.sass";

const CyberConnect = () => {
  return (
    <div className={style.cyberConnect}>
      <PageTitle title="Cyber Connect" />
      <FeedList />
    </div>
  );
};

export default CyberConnect;
