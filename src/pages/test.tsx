import { getRss } from "@/utils/rss";
import { useEffect } from "react";

const Test = () => {
  useEffect(() => {
    getRss();
  }, []);
  return <div> Hello world</div>;
};

export default Test;
