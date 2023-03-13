import { POST_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import { IParsedRssData, IRssSourceData } from "@/redux/dailySlice";
import { updateUserProfilePageHandle } from "@/redux/globalSlice";
import request from "graphql-request";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GridFeed, { EFeedType } from "../homePage/gridFeed";
import HorizontalFeed from "../homePage/horizontalFeed";
import { like } from "./helper/like";
import { handleCreator } from "./helper/profile";
import { CYBER_CONNECT_ENDPOINT } from "./constants";
import { setPostList } from "@/redux/cyberConnectSlice";

export interface Content {
  contentID: string;
  authorHandle: string;
  authorAddress: string;
  title: string;
  body: string;
  digest: string;
  arweaveTxHash: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  likedStatus: {
    liked: boolean;
    disliked: boolean;
    proof: { arweaveTxHash: string | null };
  };
}

// This only stored on Arweave, didn't launch an Onchain event
export interface Post extends Content {
  comments: Content[];
}

const PostList = ({ address }: { address: string }) => {
  const {
    cyberConnectClient,
    address: myAddress,
    lastPostsUpdateTime,
    postList,
  } = useSelector((state: IRootState) => state.persistedReducer.cyberConnect);
  const { screenWidth, userData, userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  screenWidth;
  // const [postList, setPostList] = useState<Post[]>([]);
  const daisiHandle = handleCreator(address);

  const dispatch = useDispatch();

  dispatch(updateUserProfilePageHandle(daisiHandle));

  const fetchData = async () => {
    try {
      // if (!(address && myAddress)) {
      //   return;
      // }

      let obj = {
        address,
      };

      if (myAddress) {
        obj["myAddress"] = myAddress;
      }

      const res = await request(
        CYBER_CONNECT_ENDPOINT,
        POST_BY_ADDRESS_QUERY,
        obj
      );

      // @ts-ignore
      let posts: Post[] = res.address.wallet.profiles.edges
        .map((e: any) => e.node)
        .reduce((prev: any, curr: any) => prev.concat(curr), [])
        .filter((n: any) => n.posts.edges.length > 0)
        .map((n: any) => n.posts.edges.map((e: any) => e.node))
        .reduce((prev: any, curr: any) => prev.concat(curr), []);

      // filter Daisi created Handle only
      posts = posts.filter(
        (post: Post) => post.authorHandle.split(".")[0] == daisiHandle
      );

      console.log(posts, "posts");

      const formattedPosts = posts.map((post) => {
        const formattedPost = {
          id: post.contentID,
          itemTitle: post.title,
          itemDescription: post.body.split("\n\n")[0],
          itemLink: post.body.split("\n\n").reverse()[0],
          itemImage: "",
          created: post.createdAt as unknown as string,
          likes: post.likedStatus.liked
            ? new Array(post.likeCount).fill(userData.id)
            : new Array(post.likeCount).fill("1"),
          forwards: [],
          sourceIcon: userProfilePageData.profilePicture,
          linkCreated: post.createdAt as unknown as string,
          source: {} as IRssSourceData,
        } as IParsedRssData;

        return formattedPost;
      });

      dispatch(setPostList(formattedPosts));
      console.log(formattedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  // const handleOnClick = async (contentID: string, isLike: boolean) => {
  //   await like(contentID, cyberConnectClient, isLike);
  //   await fetchData();
  // };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [myAddress, address, lastPostsUpdateTime]);

  return (
    <div>
      {postList &&
        postList.map((post) => {
          // const article = {
          //   id: post.contentID,
          //   itemTitle: post.title,
          //   itemDescription: post.body.split("\n\n")[0],
          //   itemLink: post.body.split("\n\n").reverse()[0],
          //   itemImage: "",
          //   created: post.createdAt as unknown as string,
          //   likes: post.likedStatus.liked
          //     ? new Array(post.likeCount).fill(userData.id)
          //     : new Array(post.likeCount).fill("1"),
          //   forwards: [],
          //   sourceIcon: "",
          //   linkCreated: post.createdAt as unknown as string,
          //   source: {} as IRssSourceData,
          // } as IParsedRssData;

          return (
            <div>
              {screenWidth > 900 ? (
                <HorizontalFeed article={post} type={EFeedType.CC_ITEM}>
                  {/* {post.likedStatus.liked ? (
                  <div
                    style={{ fontSize: "1.6rem" }}
                    onClick={() => {
                      handleOnClick(post.contentID, false);
                    }}
                  >
                    <i className="fa fa-heart" aria-hidden="true"></i>
                  </div>
                ) : (
                  <div
                    style={{ fontSize: "1.6rem" }}
                    onClick={() => {
                      handleOnClick(post.contentID, true);
                    }}
                  >
                    <i className="fa fa-heart-o"></i>
                  </div>
                )} */}
                </HorizontalFeed>
              ) : (
                <GridFeed article={post} type={EFeedType.CC_ITEM}>
                  {/* {post.likedStatus.liked ? (
                  <div
                    style={{ fontSize: "1.6rem" }}
                    onClick={() => {
                      handleOnClick(post.contentID, false);
                    }}
                  >
                    <i className="fa fa-heart" aria-hidden="true"></i>
                  </div>
                ) : (
                  <div
                    style={{ fontSize: "1.6rem" }}
                    onClick={() => {
                      handleOnClick(post.contentID, true);
                    }}
                  >
                    <i className="fa fa-heart-o"></i>
                  </div>
                )} */}
                </GridFeed>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default PostList;
