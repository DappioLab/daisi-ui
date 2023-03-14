import style from "@/styles/homePage/index.module.sass";
// import FeedList from "@/components/homePage/feedList";
import PageTitle from "@/components/common/pageTitle";
import FeedModal from "@/components/homePage/feedModal";
import request from "graphql-request";
import { useEffect, useState } from "react";
import {
  endpoint,
  POST_BY_ID_STATIC_FIELDS_QUERY,
} from "@/graphql/daily/query";
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
import { fetchFollowingsPosts } from "@/components/cyberConnectPage/helper";
import { IUser } from "@/pages/profile/[address]";
import { toChecksumAddress } from "ethereum-checksum-address";
import moment from "moment";
import useGumState, { filterPostList } from "@/components/gumPage/gumState";

const HomePage = () => {
  // const [showModal, setShowModal] = useState(false);
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
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
  // const [postModalIndex, setPostModalIndex] = useState<number | null>(null);
  const dispatch = useDispatch();
  useGumState();
  // const getCurrentModalIndex = (index: number) => {
  //   setPo
  // };

  // const getPost = async (id: string) => {
  //   const postData = await request(endpoint, POST_BY_ID_STATIC_FIELDS_QUERY, {
  //     id,
  //   });

  //   dispatch(updateModalData(postData));
  //   setShowModal(true);
  // };

  const getAnonymousList = async () => {
    const res = await API.getRssData();
    return res.data;
  };

  const updateList = async () => {
    try {
      dispatch(updateLoadingStatus(true));
      let allPosts: IFeedList[] = [];
      let res: IFeedList[] = await getAnonymousList();
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

      let parsedFollowingsPosts: IFeedList[] = [];

      let postUserData = {};
      let gumFeeds: IFeedList[] = [];
      if (userProfile && gumPosts.length > 0 && allUser.size > 0) {
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
              id: "",
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
            };
            gumFeeds.push(feed);
          }
        }
      }
      if (address && userData.id && userData.id != "") {
        const ccFollowingsPosts = await fetchFollowingsPosts(address);

        for (let ccPost of ccFollowingsPosts) {
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
          };

          parsedFollowingsPosts.push(post);
        }
      }

      allPosts = [...res, ...parsedFollowingsPosts, ...gumFeeds].sort((a, b) =>
        Number(a.linkCreated) < Number(b.linkCreated) ? 1 : -1
      );

      // let parsedData: any = [];

      // res.map((source) => {
      //   source.items.map((item) => {
      //     const obj = { ...item, source: { ...source } };
      //     parsedData.push(obj);
      //   });
      // });
      // console.log(parsedData, "parsedData");

      // dispatch(updateFeedList(parsedData));

      dispatch(updateFeedList(allPosts));
      dispatch(updateLoadingStatus(false));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    updateList();
    dispatch(updateFeedModalIndex(null));
    dispatch(updateShowFeedModal(false));
    dispatch(updateFeedModalData(null));
  }, []);

  useEffect(() => {
    updateList();
  }, [address, userData, userProfile, following]);

  // useEffect(() => {
  //   const content = feedList.find((feed, index) => {
  //     if (index === postModalIndex) {
  //       return feed;
  //     }
  //   });

  //   dispatch(updateModalData(content));
  // }, [postModalIndex, feedList]);

  // useEffect(() => {
  //   if (modalData) {
  //     setShowModal(true);
  //   }
  // }, [modalData]);

  // useEffect(() => {
  //   if (!showModal) {
  //     setPostModalIndex(null);
  //   }
  // }, [showModal]);

  return (
    <div className={`pageContent ${style.homePage}`}>
      {/* <PageTitle title="Daily" /> */}
      {screenWidth < 960 ? (
        <GridFeedList
          // setShowModal={setShowModal}
          // getPost={getPost}
          // getCurrentModalIndex={getCurrentModalIndex}
          // setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      ) : (
        <HorizontalFeedList
          // setShowModal={setShowModal}
          // getPost={getPost}
          // setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      )}
      {/* {showModal ? (
        <FeedModal
          setShowModal={setShowModal}
          postModalIndex={postModalIndex}
          // getPost={getPost}
          setPostModalIndex={setPostModalIndex}
        />
      ) : null} */}
    </div>
  );
};

export default HomePage;
