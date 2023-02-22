import { useSelector, useDispatch } from "react-redux";
import { updateGreet } from "@/redux/testSlice";
import { IRootState } from "@/redux";
// import { getData } from "@/graphql/daily/query";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Greeting = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { greet, name } = useSelector((state: IRootState) => state.test);
  const [testData, setTestData] = useState<{ symbol: string }[]>([]);

  // const update = async () => {
  //   dispatch(updateGreet("How've you been?"));
  //   const test = await getData();
  //   setTestData(() => test.slice(0, 10));
  // };

  return (
    <div>
      <h1>
        {greet} {name}
        <br />
        Welcome to home page
      </h1>

      <br />
      <button onClick={() => {}}>Update Greet and get data</button>
      {testData.map((item, index) => (
        <div onClick={() => router.push(`post/${index + 1}`)}>
          No.{index + 1} - {item.symbol}
        </div>
      ))}
    </div>
  );
};

export default Greeting;
