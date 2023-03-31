import { IRootState } from "@/redux";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  like,
  fetchPosts,
  connectWallet,
  createCyberConnectClient,
  checkNetwork,
} from "./helper";
import CommentBox from "./commentBox";
import { toChecksumAddress } from "ethereum-checksum-address";
import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
import LikeButton from "./likeButton";

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
          <HorizontalFeed article={obj} type={EFeedType.CC_ITEM}>
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
          {/* {isShowCommentList.get(post.contentID) ? (
            <div>
              {post.comments.map((comment) => (
                <div
                  key={post.contentID}
                  style={{
                    borderLeft: "solid .2rem #eee",
                    boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
                    padding: "1rem 2rem",
                    marginTop: "2rem",
                  }}
                >
                  {renderPostOrComment(comment, level + 1)}
                </div>
              ))}
            </div>
          ) : null} */}
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

// import { POST_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
// import { IRootState } from "@/redux";
// import { IFeedList, IParsedRssData, IRssSourceData } from "@/redux/dailySlice";
// import {
//   EFeedModalType,
//   updateFeedModalIndex,
//   updateFeedModalType,
//   updateShowFeedModal,
//   updateUserProfilePageHandle,
// } from "@/redux/globalSlice";
// import request from "graphql-request";
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import GridFeed from "../homePage/gridFeed";
// import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
// import { like } from "./helper/like";
// import { handleCreator } from "./helper/profile";
// import { CYBER_CONNECT_ENDPOINT } from "./constants";
// import { setPostList } from "@/redux/cyberConnectSlice";
// import { toChecksumAddress } from "ethereum-checksum-address";
// import moment from "moment";
// import { useRouter } from "next/router";
// import CommentBox from "./commentBox";

// export interface Content {
//   contentID: string;
//   authorHandle: string;
//   authorAddress: string;
//   title: string;
//   body: string;
//   digest: string;
//   arweaveTxHash: string;
//   createdAt: Date;
//   updatedAt: Date;
//   commentCount: number;
//   likeCount: number;
//   dislikeCount: number;
//   likedStatus: {
//     liked: boolean;
//     disliked: boolean;
//     proof: { arweaveTxHash: string | null };
//   };
// }

// // This only stored on Arweave, didn't launch an Onchain event
// export interface Post extends Content {
//   comments: Content[];
// }

// const PostList = ({ address }: { address: string }) => {
//   const {
//     address: myAddress,
//     lastPostsUpdateTime,
//     postList,
//     accessToken,
//   } = useSelector((state: IRootState) => state.persistedReducer.cyberConnect);
//   const { screenWidth, userData, userProfilePageData } = useSelector(
//     (state: IRootState) => state.persistedReducer.global
//   );

//   // const [postList, setPostList] = useState<Post[]>([]);
//   const daisiHandle = handleCreator(address);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   useEffect(() => {
//     if (accessToken) {
//       dispatch(updateUserProfilePageHandle(daisiHandle));
//     }
//   }, [accessToken]);

//   const fetchData = async () => {
//     try {
//       // if (!(address && myAddress)) {
//       //   return;
//       // }

//       let obj = {
//         address,
//       };

//       if (myAddress) {
//         obj["myAddress"] = myAddress;
//       }

//       const res = await request(
//         CYBER_CONNECT_ENDPOINT,
//         POST_BY_ADDRESS_QUERY,
//         obj
//       );

//       // @ts-ignore
//       let posts: Post[] = res.address.wallet.profiles.edges
//         .map((e: any) => e.node)
//         .reduce((prev: any, curr: any) => prev.concat(curr), [])
//         .filter((n: any) => n.posts.edges.length > 0)
//         .map((n: any) => n.posts.edges.map((e: any) => e.node))
//         .reduce((prev: any, curr: any) => prev.concat(curr), []);

//       // filter Daisi created Handle only
//       posts = posts.filter(
//         (post: Post) => post.authorHandle.split(".")[0] == daisiHandle
//       );

//       const formattedPosts = posts.map((post) => {
//         const formattedPost: IFeedList = {
//           id: post.contentID,
//           itemTitle: post.title,
//           itemDescription: post.body.split("\n\n")[0],
//           itemLink: post.body.split("\n\n").reverse()[0],
//           itemImage: "",
//           created: post.createdAt as unknown as string,
//           likes: post.likedStatus.liked
//             ? new Array(post.likeCount).fill(userData.id)
//             : new Array(post.likeCount).fill("1"),
//           forwards: [],
//           sourceIcon: userProfilePageData.profilePicture,
//           linkCreated: moment(post.createdAt).valueOf().toString(),
//           isUserPost: true,
//           userAddress: toChecksumAddress(post.authorAddress),
//           type: EFeedType.CC_ITEM,
//           sourceId: "",
//           ccPost: post,
//         };

//         return formattedPost;
//       });

//       dispatch(setPostList(formattedPosts));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // const handleOnClick = async (contentID: string, isLike: boolean) => {
//   //   await like(contentID, cyberConnectClient, isLike);
//   //   await fetchData();
//   // };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [myAddress, address, lastPostsUpdateTime, userProfilePageData]);

//   const renderComment = (content: Post, level: number = 0) => {
//     return (
//       <div key={content.contentID}>
//         <CommentBox
//           contentId={content.contentID}
//           address={myAddress}
//           fetchData={fetchData}
//         />
//         {content.comments.length > 0 && (
//           <div style={{ border: "solid 1px #333" }}>
//             {content.comments.map((comment) =>
//               // @ts-ignore
//               renderPostOrComment(comment, level + 1)
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div>
//       {postList.length > 0 &&
//         postList.map((post, index) => {
//           return (
//             <div key={post.id}>
//               {screenWidth > 900 ? (
//                 <div>
//                   <div
//                     onClick={() => {
//                       dispatch(updateFeedModalType(EFeedModalType.PROFILE_CC));
//                       dispatch(updateFeedModalIndex(index));
//                       dispatch(updateShowFeedModal(true));
//                     }}
//                   >
//                     <HorizontalFeed article={post} type={EFeedType.CC_ITEM}>
//                       {}
//                     </HorizontalFeed>
//                   </div>
//                   <CommentBox
//                     contentId={post.ccPost.contentID}
//                     address={myAddress}
//                     fetchData={fetchData}
//                   />
//                   {JSON.stringify(post.ccPost.comments)}
//                   {post.ccPost.comments.length > 0 && (
//                     <div style={{ border: "solid 1px #333" }}>
//                       {post.ccPost.comments.map((comment) =>
//                         renderComment(comment)
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div
//                   key={post.id}
//                   onClick={() => {
//                     dispatch(updateFeedModalType(EFeedModalType.PROFILE_CC));
//                     dispatch(updateFeedModalIndex(index));
//                     dispatch(updateShowFeedModal(true));
//                   }}
//                 >
//                   <GridFeed article={post} type={EFeedType.CC_ITEM}>
//                     {}
//                   </GridFeed>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//     </div>
//   );
// };

// export default PostList;
