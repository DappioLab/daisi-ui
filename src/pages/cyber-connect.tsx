import PageTitle from "@/components/common/pageTitle";
import PostList from "@/components/cyberConnectPage/postList";
import { IRootState } from "@/redux";
import style from "@/styles/cyberConnectPage/index.module.sass";
import { useSelector } from "react-redux";

const CyberConnect = () => {
  const { address } = useSelector((state: IRootState) => state.cyberConnect);
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
