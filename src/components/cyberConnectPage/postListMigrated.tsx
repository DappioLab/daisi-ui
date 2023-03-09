import {
  POST_BY_ADDRESS_QUERY,
  cyberConnectEndpoint,
} from "@/graphql/cyberConnect/query";
import { IRootState } from "@/redux";
import { IParsedRssData, IRssSourceData } from "@/redux/dailySlice";
import request from "graphql-request";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { EFeedType } from "../homePage/gridFeed";
import HorizontalFeed from "../homePage/horizontalFeed";
import { like } from "./helper/like";
import { handleCreator } from "./helper/profile";

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
  } = useSelector((state: IRootState) => state.cyberConnect);
  const [postList, setPostList] = useState<Post[]>([]);
  const daisiHandle = handleCreator(address);

  const fetchData = async () => {
    try {
      if (!(address && myAddress)) {
        return;
      }

      const res = await request(cyberConnectEndpoint, POST_BY_ADDRESS_QUERY, {
        address,
        myAddress,
      });

      // @ts-ignore
      let posts = res.address.wallet.profiles.edges
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

      setPostList(posts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOnClick = async (contentID: string, isLike: boolean) => {
    await like(contentID, cyberConnectClient, isLike);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [myAddress, address, lastPostsUpdateTime]);

  return (
    <div>
      {postList.map((post) => {
        let likes = [];
        for (let i = 0; i < post.likeCount; i++) {
          likes.push(i);
        }

        const article = {
          id: "",
          itemTitle: post.title,
          itemDescription: post.body,
          itemLink: "",
          itemImage: "",
          created: post.createdAt as unknown as string,
          likes: likes,
          forwards: [],
          sourceIcon: "",
          linkCreated: post.createdAt as unknown as string,
          source: {} as IRssSourceData,
        } as IParsedRssData;

        return (
          <div>
            <HorizontalFeed article={article} type={EFeedType.CC_ITEM}>
              {post.likedStatus.liked ? (
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
              )}
            </HorizontalFeed>
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
