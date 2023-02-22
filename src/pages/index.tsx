import style from "@/styles/homePage/index.module.sass";
import Greeting from "@/components/homePage/greeting";
import FeedList from "@/components/homePage/feedList";
import PageTitle from "@/components/common/pageTitle";

const HomePage = () => {
  return (
    <div className={style.homePage}>
      {/* <Greeting />
      <br /> */}
      <PageTitle title="Daily" />
      <FeedList />
    </div>
  );
};

export default HomePage;
