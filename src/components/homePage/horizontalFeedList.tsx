import style from "@/styles/homePage/horizontalFeedList.module.sass";
import request from "graphql-request";
// import Feed, { IFeed } from "./feed";
import HorizontalFeed from "./horizontalFeed";
import { endpoint, ANONYMOUS_FEED_QUERY } from "@/graphql/daily/query";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { IRssSourceData, updateFeedList } from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import { fetchPostData, parseGumData } from "@/utils/gum";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";
import { useGumSDK } from "@/hooks/useGumSDK";
import { GRAPHQL_ENDPOINTS } from "@gumhq/sdk";
import { getData, parseCyberConnectData } from "@/utils/cyberConnect";
import API from "@/axios/api";

interface IFeedList {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  getPost: (id: string) => Promise<void>;
  getCurrentModalIndex: () => number;
}

const HorizontalFeedList = (props: IFeedList) => {
  const wallet = useWallet();
  const [feedOptions, setFeedOptions] = useState({});
  const { currentId, feedList } = useSelector(
    (state: IRootState) => state.daily
  );
  const { ref, inView } = useInView();
  const dispatch = useDispatch();

  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com", "confirmed"),
    []
  );
  const sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );

  // const getAnonymousList = async () => {
  //   const res = await request(endpoint, ANONYMOUS_FEED_QUERY, feedOptions);
  //   const parsedData = res.page.edges.map((item: any) => item.node);
  //   setFeedOptions({ after: res.page.pageInfo.endCursor });

  //   return parsedData;
  // };
  const getAnonymousList = async () => {
    const res = await API.getRssData();
    return res.data;
    // console.log(res, "???");
  };

  // useEffect(() => {
  //   if (inView) {
  //     (async () => {
  //       const dailyData = await getAnonymousList();
  //       dispatch(updateFeedList([...feedList, ...dailyData]));
  //     })();
  //   }
  // }, [inView]);

  // useEffect(() => {
  //   let list: IFeed[] = [];

  //   (async () => {
  //     const dailyData = await getAnonymousList();
  //     list = [...list, ...dailyData];
  //     dispatch(updateFeedList(list)); // others API too slow, separate the render first

  //     const cyberConnectData = await getData();
  //     const cyberConnectParsedData = parseCyberConnectData(cyberConnectData);
  //     list = [...list, ...cyberConnectParsedData];
  //     dispatch(updateFeedList(list));
  //   })();

  //   if (!sdk) {
  //     return;
  //   }

  //   (async () => {
  //     let gumData = await fetchPostData(wallet, sdk);
  //     let gumParsedData: IFeed[] = [];

  //     if (gumData) {
  //       gumParsedData = await parseGumData(gumData);
  //     }

  //     list = [...list, ...gumParsedData];
  //     dispatch(updateFeedList(list));
  //   })();
  // }, [wallet.connected, sdk]);

  // useEffect(() => {
  //   const currentIndex = props.getCurrentModalIndex();
  //   if (feedList.length - 10 < currentIndex) {
  //     getAnonymousList();
  //   }
  // }, [currentId]);

  useEffect(() => {
    (async () => {
      const data = await getAnonymousList();
      dispatch(updateFeedList(data));
    })();
  }, []);

  return (
    <div className={style.horizontalFeedList}>
      {feedList.map((item, index) => {
        const sourceData: IRssSourceData = {
          sourceTitle: item.sourceTitle,
          sourceDescription: item.sourceDescription,
          sourceIcon: item.sourceIcon,
          sourceLink: item.sourceLink,
        };

        return (
          <>
            {item.items.map((source) => {
              return (
                <div key={index} ref={ref}>
                  <HorizontalFeed
                    sourceData={sourceData}
                    article={source}
                    setShowModal={props.setShowModal}
                    getPost={props.getPost}
                  />
                </div>
              );
            })}
          </>
        );
        // return (
        //   <div key={index} ref={ref}>
        //     <HorizontalFeed
        //       article={item}
        //       setShowModal={props.setShowModal}
        //       getPost={props.getPost}
        //     />
        //   </div>
        // );
      })}
    </div>
  );
};

export default HorizontalFeedList;
