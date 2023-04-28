import style from "@/styles/homePage/index.module.sass";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IFeedList, IRssSourceItem, updateFeedList } from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import { EFeedType } from "@/components/homePage/horizontalFeed";
import HorizontalFeedList from "@/components/homePage/horizontalFeedList";
import GridFeedList from "@/components/homePage/gridFeedList";
import API from "@/axios/api";
import {
  EFeedModalType,
  updateFeedModalData,
  updateFeedModalIndex,
  updateLoadingStatus,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import { fetchFollowingsPosts } from "@/utils/cyberConnect";
import { IUser } from "@/pages/profile";
import moment from "moment";
import useGumState, { filterPostList } from "@/components/gum/useGumState";
import { setPostList } from "@/redux/cyberConnectSlice";
import useCyberConnect from "@/components/cyberConnect/useCyberConnect";

export enum EDisplayMode {
  GRID = 0,
  HORIZONTAL = 1,
}

export interface IPostProps {
  item: any;
  updateList: () => void;
}

const HomePage = () => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );

  const [displayMode, setDisplayMode] = useState(EDisplayMode.HORIZONTAL);

  const { screenWidth, userData, address } = useSelector(
    (state: IRootState) => {
      return {
        screenWidth: state.persistedReducer.global.screenWidth,
        userData: state.persistedReducer.global.userData,
        address: state.persistedReducer.cyberConnect.address,
      };
    }
  );
  const {
    userProfile,
    allPosts: gumPosts,
    following,
    allUser,
  } = useSelector((state: IRootState) => state.persistedReducer.gum);
  const [rssFeed, setRssFeed] = useState<IFeedList[]>([]);
  const [gumFeed, setGumFeed] = useState<IFeedList[]>([]);
  const [ccFeed, setCcFeed] = useState<IFeedList[]>([]);

  const dispatch = useDispatch();
  const { fetchPostData, parseComments } = useCyberConnect();
  useGumState(); // Gum initialize state; need to be refactored - data flow, merge with useGum and useGumState

  const getRssList = async () => {
    const res = await API.getRssData();
    return res.data;
  };

  const updateCC = async () => {
    try {
      if (address && userData.id && userData.id != "") {
        dispatch(updateLoadingStatus(true));
        const ccUserPosts = await fetchPostData(address);
        const ccFollowingsPosts = await fetchFollowingsPosts(address);
        const allCcPosts = [
          ...ccUserPosts,
          ...ccFollowingsPosts,
        ] as unknown as IFeedList[];

        setCcFeed(allCcPosts);
        parseComments(allCcPosts);
        setGumFeed([]);
        dispatch(setPostList(allCcPosts));

        dispatch(updateLoadingStatus(false));
      }
    } catch (err) {
      console.log(err);
      dispatch(updateLoadingStatus(false));
    }
  };

  const updateGum = async () => {
    try {
      let gumFeeds: IFeedList[] = [];

      if (
        userProfile &&
        gumPosts.length > 0 &&
        allUser.size > 0 &&
        gumFeed.length <= 0
      ) {
        dispatch(updateLoadingStatus(true));
        let gumFollowing = following.map((conn) => {
          return conn.follow;
        });
        let posts = filterPostList(gumPosts, [
          ...gumFollowing,
          userProfile.profile,
        ]);
        for (let post of posts) {
          let wallet = allUser.get(post.profile.toString()).wallet;
          let user: IUser = (await API.getUserByAddress(wallet.toString()))
            .data;

          if (user) {
            let daisiContent = post.daisiContent;
            const feed: IFeedList = {
              isUserPost: true,
              type: EFeedType.GUM_ITEM,
              sourceId: "",
              userAddress: address,
              id: post.cl_pubkey.toString(),
              itemTitle: daisiContent.itemTitle,
              itemDescription: daisiContent.itemDescription,
              itemLink: daisiContent.itemLink,
              itemImage: daisiContent.itemImage,
              created: moment(daisiContent.created).valueOf().toString(),
              likes: [],
              forwards: [],
              sourceIcon: user.profilePicture ? user.profilePicture : "",
              linkCreated: moment(daisiContent.created).valueOf().toString(),
              cl_pubkey: post.cl_pubkey,
              gumPost: post,
            };
            gumFeeds.push(feed);
          }
        }
        setGumFeed(gumFeeds);
        setCcFeed([]);
        dispatch(updateLoadingStatus(false));
      }
    } catch (err) {
      console.log(err);
      dispatch(updateLoadingStatus(false));
    }
  };

  const updateList = async () => {
    try {
      dispatch(updateLoadingStatus(true));
      updateCC();
      updateGum();
      let res: IFeedList[] = [];

      if (rssFeed.length <= 0) {
        res = await getRssList();
        res = res.map((item: IRssSourceItem) => {
          const obj: IFeedList = {
            isUserPost: false,
            userAddress: null,
            sourceIcon: item.sourceIcon,
            sourceId: item.id,
            itemTitle: item.itemTitle,
            itemDescription: "",
            itemImage: "",
            itemLink: item.itemLink,
            likes: item.likes,
            forwards: [],
            linkCreated: item.linkCreated,
            id: item.id,
            type: EFeedType.RSS_ITEM,
            created: item.created,
          };
          return obj;
        });

        setRssFeed(res);
      }
      dispatch(updateLoadingStatus(false));
    } catch (err) {
      console.log(err);
      dispatch(updateLoadingStatus(false));
    }
  };

  useEffect(() => {
    updateList();
    dispatch(updateFeedModalIndex(null));
    dispatch(updateShowFeedModal(false));
    dispatch(updateFeedModalData(null));
  }, []);

  useEffect(() => {
    updateGum();
  }, [following, userProfile, gumPosts, allUser, gumFeed]);

  useEffect(() => {
    updateCC();
  }, [address]);

  useEffect(() => {
    let allPosts = [...rssFeed, ...ccFeed, ...gumFeed].sort((a, b) =>
      Number(a.linkCreated) < Number(b.linkCreated) ? 1 : -1
    );

    dispatch(updateFeedList(allPosts));
  }, [rssFeed, gumFeed, ccFeed]);

  // inline-style need to be refactored
  return (
    <div className={`pageContent ${style.homePage}`}>
      {screenWidth >= 960 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            maxWidth: "60%",
            margin: "auto",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              width: "7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              border: "solid .1rem #eee",
              borderRadius: "2rem",
            }}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setDisplayMode(EDisplayMode.GRID)}
            >
              {displayMode === EDisplayMode.GRID ? (
                <img src="/img_grid_light_mode_on.svg" alt="" />
              ) : (
                <img src="/img_grid_light_mode_off.svg" alt="" />
              )}
            </div>
            <div
              style={{ cursor: "pointer" }}
              onClick={() => setDisplayMode(EDisplayMode.HORIZONTAL)}
            >
              {displayMode === EDisplayMode.HORIZONTAL ? (
                <img src="/img_list_light_mode_on.svg" alt="" />
              ) : (
                <img src="/img_list_light_mode_off.svg" alt="" />
              )}
            </div>
          </div>
        </div>
      )}
      {screenWidth < 960 || displayMode === EDisplayMode.GRID ? (
        <GridFeedList
          updateList={updateList}
          list={feedList}
          position={EFeedModalType.DISCOVER_ITEM}
        />
      ) : (
        <HorizontalFeedList
          updateList={updateList}
          list={feedList}
          position={EFeedModalType.DISCOVER_ITEM}
        />
      )}
    </div>
  );
};

export default HomePage;
