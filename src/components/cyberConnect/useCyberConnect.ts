import { useCallback, useState } from "react";
import { Post } from "./cyberConnectPostList";
import { fetchPosts } from "@/utils/cyberConnect";
import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import { IFeedList } from "@/redux/dailySlice";
import { IUser } from "@/pages/profile";
import { toChecksumAddress } from "ethereum-checksum-address";
import API from "@/axios/api";
import moment from "moment";
import { EFeedType } from "../homePage/horizontalFeed";
import { setCommentMap } from "@/redux/cyberConnectSlice";

const useCyberConnect = () => {
  const { userData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const [postList, setPostList] = useState<IFeedList[]>([]);
  const { address: myAddress, lastPostsUpdateTime } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  let parsedMap = new Map<string, Post>();
  const dispatch = useDispatch();

  const fetchPostData = useCallback(async (address: string) => {
    let postUserData = {};
    let parsedPosts: IFeedList[] = [];

    try {
      if (!(address && myAddress)) {
        return;
      }

      const posts = await fetchPosts(address, myAddress);

      for (let ccPost of posts) {
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

        parsedPosts.push(post);
      }

      setPostList(parsedPosts);
      return parsedPosts;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const parseComments = useCallback((posts) => {
    const allPosts = posts.map((item) => item.ccPost);

    recursive(allPosts);
    const objFromMap = Object.fromEntries(parsedMap);
    dispatch(setCommentMap(objFromMap));
  }, []);

  const recursive = useCallback((comments: any) => {
    comments.map((item) => {
      if (item.comments && item.comments.length > 0) {
        parsedMap.set(item.contentID, item.comments);

        recursive(item.comments);
      }
    });
  }, []);

  return { postList, fetchPostData, parseComments };
};

export default useCyberConnect;
