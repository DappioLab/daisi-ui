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
  IParsedRssData,
  updateFeedList,
  updateModalData,
} from "@/redux/dailySlice";
import { IRootState } from "@/redux";
import HorizontalFeed from "@/components/homePage/horizontalFeed";
import HorizontalFeedList from "@/components/homePage/horizontalFeedList";
import GridFeedList from "@/components/homePage/gridFeedList";
import API from "@/axios/api";
import { updateLoadingStatus } from "@/redux/globalSlice";
import { fetchFollowingsPosts } from "@/components/cyberConnectPage/helper";
import { IUser } from "@/pages/profile/[address]";
import { toChecksumAddress } from "ethereum-checksum-address";

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const { feedList, modalData } = useSelector(
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
  const [searchIndex, setSearchIndex] = useState(0);
  const [postModalIndex, setPostModalIndex] = useState<number | null>(null);
  const dispatch = useDispatch();

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
    let nextNumber = searchIndex + 1;
    setSearchIndex(nextNumber);
    const res = await API.getRssData();
    return res.data;
  };

  const updateList = async () => {
    try {
      dispatch(updateLoadingStatus(true));
      let allPosts: IParsedRssData[] = [];
      const res: IParsedRssData[] = await getAnonymousList();

      let parsedFollowingsPosts: IParsedRssData[] = [];

      let postUserData = {};

      if (address && userData.id && userData.id != "") {
        const ccFollowingsPosts = await fetchFollowingsPosts(address);
        console.log(ccFollowingsPosts, "ccFollowingsPosts");

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
          // mappedCcFollowingsPosts = ccFollowingsPosts.map((ccPost) => {

          const post: any = {
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
            linkCreated: new Date(ccPost.createdAt).getTime().toString(),
            id: ccPost.contentID,
          };

          parsedFollowingsPosts.push(post);
          // return post;
          // });
        }

        console.log(parsedFollowingsPosts, "ccFollowingPost");
      }

      allPosts = [...res, ...parsedFollowingsPosts].sort((a, b) =>
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
  }, []);
  useEffect(() => {
    updateList();
  }, [address, userData]);

  useEffect(() => {
    const content = feedList.find((feed, index) => {
      if (index === postModalIndex) {
        return feed;
      }
    });

    dispatch(updateModalData(content));
  }, [postModalIndex, feedList]);

  useEffect(() => {
    if (modalData) {
      setShowModal(true);
    }
  }, [modalData]);

  useEffect(() => {
    if (!showModal) {
      setPostModalIndex(null);
    }
  }, [showModal]);

  return (
    <div className={`pageContent ${style.homePage}`}>
      {/* <PageTitle title="Daily" /> */}
      {screenWidth < 960 ? (
        <GridFeedList
          setShowModal={setShowModal}
          // getPost={getPost}
          // getCurrentModalIndex={getCurrentModalIndex}
          setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      ) : (
        <HorizontalFeedList
          setShowModal={setShowModal}
          // getPost={getPost}
          setPostModalIndex={setPostModalIndex}
          updateList={updateList}
        />
      )}
      {showModal ? (
        <FeedModal
          setShowModal={setShowModal}
          postModalIndex={postModalIndex}
          // getPost={getPost}
          setPostModalIndex={setPostModalIndex}
        />
      ) : null}
    </div>
  );
};

export default HomePage;
