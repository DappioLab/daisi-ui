import style from "@/styles/homePage/index.module.sass";
import { useSelector, useDispatch } from "react-redux";
import { updateGreet } from "@/redux/testSlice";
import { IRootState } from "@/redux";
import { getData } from "@/graphql/test1/query";

const HomePage = () => {
  const dispatch = useDispatch();
  const { greet, name } = useSelector((state: IRootState) => state.test);

  const update = async () => {
    dispatch(updateGreet("Greet updated"));
    const test = await getData();
    console.log(test, "test");
  };

  return (
    <div className={style.homePage}>
      {greet} {name}, Welcome to home page
      <button onClick={() => update()}>Update Greet and get data</button>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
      <div>Sidebar</div>
    </div>
  );
};

export default HomePage;
