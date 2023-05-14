import API from "@/axios/api";
import style from "@/styles/homePage/index.module.sass";
import moment from "moment";
import useGumState, { filterPostList } from "@/components/gum/useGumState";
import useCyberConnect from "@/components/cyberConnect/useCyberConnect";
import HorizontalPostList from "@/components/homePage/horizontalPostList";
import GridPostList from "@/components/homePage/gridPostList";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IPostList,
  IRssSourceItem,
  updatePostList,
} from "@/redux/discoverSlice";
import { IRootState } from "@/redux";
import { setPostList } from "@/redux/cyberConnectSlice";
import { fetchFollowingsPosts } from "@/utils/cyberConnect";
import { IUser } from "@/pages/profile";
import {
  EPostModalType,
  updatePostModalData,
  updatePostModalIndex,
  updateLoadingStatus,
  updateShowPostModal,
} from "@/redux/globalSlice";

export enum EDisplayMode {
  GRID = 0,
  HORIZONTAL = 1,
}

export enum EPostType {
  RSS_ITEM = "RSS ITEM",
  CC_ITEM = "CC ITEM",
  GUM_ITEM = "GUM ITEM",
}

export interface IPostProps {
  item: any;
  updateList: () => void;
}

const HomePage = () => {
  const { postList } = useSelector(
    (state: IRootState) => state.persistedReducer.discover
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
  const [rssPostList, setRssPostList] = useState<IPostList[]>([]);
  const [gumPostList, setGumPostList] = useState<IPostList[]>([]);
  const [cyberConnectPostList, setCyberConnectPostList] = useState<IPostList[]>(
    []
  );

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
        ] as unknown as IPostList[];

        setCyberConnectPostList(allCcPosts);
        parseComments(allCcPosts);
        setGumPostList([]);
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
      let gumPostList: IPostList[] = [];

      if (
        userProfile &&
        gumPosts.length > 0 &&
        allUser.size > 0 &&
        gumPostList.length <= 0
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
            const postListItem: IPostList = {
              isUserPost: true,
              type: EPostType.GUM_ITEM,
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
            gumPostList.push(postListItem);
          }
        }
        setGumPostList(gumPostList);
        setCyberConnectPostList([]);
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
      let res: IPostList[] = [];

      if (rssPostList.length <= 0) {
        res = await getRssList();
        res = res.map((item: IRssSourceItem) => {
          const obj: IPostList = {
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
            type: EPostType.RSS_ITEM,
            created: item.created,
          };
          return obj;
        });

        setRssPostList(res);
      }
      dispatch(updateLoadingStatus(false));
    } catch (err) {
      console.log(err);
      dispatch(updateLoadingStatus(false));
    }
  };

  useEffect(() => {
    updateList();
    dispatch(updatePostModalIndex(null));
    dispatch(updateShowPostModal(false));
    dispatch(updatePostModalData(null));
  }, []);

  useEffect(() => {
    updateGum();
  }, [following, userProfile, gumPosts, allUser, gumPostList]);

  useEffect(() => {
    updateCC();
  }, [address]);

  useEffect(() => {
    let allPosts = [
      ...rssPostList,
      ...cyberConnectPostList,
      ...gumPostList,
    ].sort((a, b) => (Number(a.linkCreated) < Number(b.linkCreated) ? 1 : -1));

    dispatch(updatePostList(allPosts));
  }, [rssPostList, gumPostList, cyberConnectPostList]);

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
        <GridPostList
          updateList={updateList}
          list={postList}
          position={EPostModalType.DISCOVER_ITEM}
        />
      ) : (
        <HorizontalPostList
          updateList={updateList}
          list={postList}
          position={EPostModalType.DISCOVER_ITEM}
        />
      )}
    </div>
  );
};

export default HomePage;
