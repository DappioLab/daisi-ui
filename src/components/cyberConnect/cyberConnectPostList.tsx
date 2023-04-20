import { IRootState } from "@/redux";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPosts } from "@/utils/cyberConnect";
import CommentBox from "./cyberConnectCommentBox";
import { toChecksumAddress } from "ethereum-checksum-address";
import HorizontalFeed, {
  EFeedType,
} from "@/components/homePage/horizontalFeed";
import LikeButton from "./cyberConnectLikeButton";

export interface Post {
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
  comments: Post[];
}

const PostList = ({ address }: { address: string }) => {
  const { address: myAddress, lastPostsUpdateTime } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [postList, setPostList] = useState<Post[]>([]);
  const { userData, userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());
  const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
    Map<string, boolean>
  >(new Map());

  const fetchData = async () => {
    try {
      if (!(address && myAddress)) {
        return;
      }

      const posts = await fetchPosts(address, myAddress);
      setPostList(posts);
    } catch (err) {
      console.error(err);
    }
  };

  // const handleOnClick = async (contentID: string, isLike: boolean) => {
  //   const provider = await connectWallet();
  //   await checkNetwork(provider);
  //   const cyberConnectClient = createCyberConnectClient(provider);
  //   await like(contentID, cyberConnectClient, isLike);
  //   await fetchData();
  // };

  useEffect(() => {
    const parsed = new Map();
    postList.map((item) => {
      parsed.set(item.contentID, false);
    });
    setIsShowCommentList(parsed);
    setIsShowCommentInputBlock(parsed);
  }, [postList]);

  useEffect(() => {
    fetchData();
  }, [myAddress, address, lastPostsUpdateTime]);

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };

  const toggleCommentInputBlock = (key: string) => {
    const updated = new Map(isShowCommentInputBlock);

    updated.set(key, !isShowCommentInputBlock.get(key));
    setIsShowCommentInputBlock(updated);
  };

  const renderPostOrComment = (post: Post, level: number = 0) => {
    const obj = {
      id: post.contentID,
      itemTitle: post.body,
      itemDescription: post.body.split("\n\n")[0],
      itemLink: post.body.split("\n\n").reverse()[0],
      itemImage: "",
      created: post.createdAt as unknown as string,
      likes: post.likedStatus.liked
        ? new Array(post.likeCount).fill(userData.id)
        : new Array(post.likeCount).fill("1"),
      forwards: [],
      sourceIcon: userProfilePageData.profilePicture,
      linkCreated: moment(post.createdAt).valueOf().toString(),
      isUserPost: true,
      userAddress: toChecksumAddress(post.authorAddress),
      type: EFeedType.CC_ITEM,
      sourceId: "",
      ccPost: post,
    };

    return (
      <>
        {level == 0 && (
          <HorizontalFeed item={obj}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginTop: "1rem",
              }}
            >
              <LikeButton post={post} updateCC={fetchData} />
              <div
                style={{
                  cursor: "pointer",
                  marginLeft: "2rem",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCommentInputBlock(post.contentID);
                }}
              >
                <i
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 500,
                    margin: "0 2rem 0 .5rem",
                  }}
                  className="fa fa-comment-o"
                  aria-hidden="true"
                />
                {isShowCommentInputBlock.get(post.contentID) ? (
                  <CommentBox
                    contentId={post.contentID}
                    address={myAddress}
                    fetchData={fetchData}
                  />
                ) : null}
              </div>
              {post.comments.length > 0 &&
              !isShowCommentList.get(post.contentID) ? (
                <div
                  style={{
                    marginRight: "2rem",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCommentList(post.contentID);
                  }}
                >
                  More ({post.comments.length})
                </div>
              ) : null}
            </div>
          </HorizontalFeed>
        )}
        <div>
          {level !== 0 && (
            <div
              style={{
                fontSize: "1.4rem",
                margin: "2rem 0",
              }}
            >
              {post.body}
            </div>
          )}
          {level !== 0 && (
            <div
              style={{ display: "flex" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentInputBlock(post.contentID);
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {/* <div>Comment</div> */}
                <i
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 500,
                    margin: "0 2rem 0 .5rem",
                  }}
                  className="fa fa-comment-o"
                  aria-hidden="true"
                />
              </div>
              {post.comments.length > 0 &&
              !isShowCommentList.get(post.contentID) ? (
                <div
                  style={{
                    marginRight: "2rem",
                    fontSize: "1.4rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCommentList(post.contentID);
                  }}
                >
                  More ({post.comments.length})
                </div>
              ) : null}
            </div>
          )}
          {isShowCommentInputBlock.get(post.contentID) && level !== 0 ? (
            <CommentBox
              contentId={post.contentID}
              address={myAddress}
              fetchData={fetchData}
            />
          ) : null}
          {post.comments.length > 0 && isShowCommentList.get(post.contentID) ? (
            <div>
              {post.comments.map((comment) => (
                <div
                  key={post.contentID}
                  style={{
                    borderLeft: "solid .2rem #eee",
                    boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
                    padding: "1rem 2rem",
                    marginTop: "2rem",
                    maxWidth: "60rem",
                  }}
                >
                  {renderPostOrComment(comment, level + 1)}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div>
      {postList.map((post) => {
        return renderPostOrComment(post);
      })}
    </div>
  );
};

export default PostList;
