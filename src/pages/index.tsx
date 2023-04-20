import style from "@/styles/homePage/index.module.sass";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IApiRssListResponse,
  IFeedList,
  IParsedRssData,
  IRssSourceItem,
  updateFeedList,
} from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import HorizontalFeed, {
  EFeedType,
} from "@/components/homePage/horizontalFeed";
import HorizontalFeedList from "@/components/homePage/horizontalFeedList";
import GridFeedList from "@/components/homePage/gridFeedList";
import API from "@/axios/api";
import {
  updateFeedModalData,
  updateFeedModalIndex,
  updateLoadingStatus,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import { fetchFollowingsPosts, fetchPosts } from "@/utils/cyberConnect";
import { IUser } from "@/pages/profile";
import { toChecksumAddress } from "ethereum-checksum-address";
import moment from "moment";
import useGumState, { filterPostList } from "@/components/gum/useGumState";
import { setCommentMap } from "@/redux/cyberConnectSlice";
import { Post } from "@/components/cyberConnect/cyberConnectPostList";

export enum EDisplayMode {
  GRID = 0,
  HORIZONTAL = 1,
}

export interface IPostProps {
  item: any;
  updateList: () => void;
}

const HomePage = () => {
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
  const dispatch = useDispatch();
  const [rssFeed, setRssFeed] = useState<IFeedList[]>([]);
  useGumState();
  const [gumFeed, setGumFeed] = useState<IFeedList[]>([]);
  const [ccFeed, setCcFeed] = useState<IFeedList[]>([]);

  const getAnonymousList = async () => {
    const res = await API.getRssData();
    return res.data;
  };

  const updateList = async () => {
    try {
      updateCC();
      updateGum();
      dispatch(updateLoadingStatus(true));
      let res: IFeedList[] = [];

      if (rssFeed.length <= 0) {
        res = await getAnonymousList();
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

  const updateCC = async () => {
    try {
      let postUserData = {};
      let parsedFollowingsPosts: IFeedList[] = [];

      if (address && userData.id && userData.id != "") {
        dispatch(updateLoadingStatus(true));
        const ccUserPosts = await fetchPosts(address, address);
        const ccFollowingsPosts = await fetchFollowingsPosts(address);
        const allCcPosts = [...ccUserPosts, ...ccFollowingsPosts];

        for (let ccPost of allCcPosts) {
          let user: IUser | null = null;
          const userAddress = toChecksumAddress(ccPost.authorAddress);
          if (!postUserData[userAddress]) {
            user = await (await API.getUserByAddress(userAddress)).data;

            if (!user) {
              continue;
            }
            postUserData[userAddress] = user;
          } else {
            user = postUserData[userAddress];
          }

          const post: IFeedList = {
            isUserPost: true,
            userAddress,
            sourceIcon: user.profilePicture,
            sourceId: ccPost.contentID,
            itemTitle: ccPost.title,
            itemDescription: ccPost.body.split("\n\n")[0],
            itemImage: "",
            itemLink: ccPost.body.split("\n\n").reverse()[0],
            likes: ccPost.likedStatus.liked
              ? new Array(ccPost.likeCount).fill(userData.id)
              : new Array(ccPost.likeCount).fill("123"),
            forwards: [],
            linkCreated: moment(ccPost.createdAt).valueOf().toString(),
            id: ccPost.contentID,
            type: EFeedType.CC_ITEM,
            created: new Date(ccPost.createdAt).getTime().toString(),
            ccPost: ccPost,
          };

          parsedFollowingsPosts.push(post);
        }
        setCcFeed(JSON.parse(JSON.stringify(parsedFollowingsPosts)));
        setGumFeed([]);
        dispatch(updateLoadingStatus(false));
      }
    } catch (err) {
      console.log(err);
      dispatch(updateLoadingStatus(false));
    }
  };

  const updateGum = async () => {
    console.log(1);

    try {
      let gumFeeds: IFeedList[] = [];
      console.log(2);

      if (
        userProfile &&
        gumPosts.length > 0 &&
        allUser.size > 0 &&
        gumFeed.length <= 0
      ) {
        console.log(3);

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

  useEffect(() => {
    let parsedMap = new Map<string, Post>();

    const recursive = (comments: any) => {
      comments.map((item) => {
        if (item.comments && item.comments.length > 0) {
          parsedMap.set(item.contentID, item.comments);

          recursive(item.comments);
        }
      });
    };

    const parseComments = () => {
      const allPosts = ccFeed.map((item) => item.ccPost);

      recursive(allPosts);

      const objFromMap = Object.fromEntries(parsedMap);
      dispatch(setCommentMap(objFromMap));
    };
    parseComments();
  }, [ccFeed]);

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
        <GridFeedList updateList={updateList} />
      ) : (
        <div>
          <HorizontalFeedList updateList={updateList} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
