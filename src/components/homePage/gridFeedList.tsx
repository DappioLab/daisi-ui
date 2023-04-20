import style from "@/styles/homePage/gridFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { IRootState } from "@/redux";
import GridFeed from "./gridFeed";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import GumLikeButton from "./gumLikeButton";
import ReplyForm from "../gum/gumCommentForm";
import ReplyList from "../gum/gumCommentList";
import CommentBox from "../cyberConnect/cyberConnectCommentBox";
import LikeButton from "@/components/cyberConnect/cyberConnectLikeButton";
import moment from "moment";
import { toChecksumAddress } from "ethereum-checksum-address";
import RssGridPost from "../rss/rssGridPost";
import GumGridPost from "../gum/gumGridPost";
import CyberConnectGridPost from "../cyberConnect/cyberConnectGridPost";

interface IFeedList {
  updateList: () => void;
}

const GridFeedList = (props: IFeedList) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );

  const dispatch = useDispatch();

  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  useEffect(() => {
    const isShowComment = new Map();
    feedList.map((item) => {
      isShowComment.set(item.id, false);
    });

    setIsShowCommentList(() => isShowComment);
  }, [feedList]);

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div
            style={{ position: "relative", height: "100%" }}
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            {item.type === EFeedType.RSS_ITEM && (
              <RssGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.GUM_ITEM && (
              <GumGridPost item={item} updateList={props.updateList} />
            )}
            {item.type === EFeedType.CC_ITEM && (
              <CyberConnectGridPost
                item={item.ccPost}
                updateList={props.updateList}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GridFeedList;

// const RenderPostOrComment = (props: IRenderPostOrComment) => {
//   const { address: myAddress } = useSelector(
//     (state: IRootState) => state.persistedReducer.cyberConnect
//   );

//   const { userData, userProfilePageData } = useSelector(
//     (state: IRootState) => state.persistedReducer.global
//   );

//   const toggleCommentInputBlock = (key: string) => {
//     const updated = new Map(isShowCommentInputBlock);

//     updated.set(key, !isShowCommentInputBlock.get(key));
//     setIsShowCommentInputBlock(updated);
//   };

//   const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
//     Map<string, boolean>
//   >(new Map());

//   const obj = {
//     id: props.post.contentID,
//     itemTitle: props.post.body,
//     itemDescription: props.post.body.split("\n\n")[0],
//     itemLink: props.post.body.split("\n\n").reverse()[0],
//     itemImage: "",
//     created: props.post.createdAt as unknown as string,
//     likes: props.post.likedStatus.liked
//       ? new Array(props.post.likeCount).fill(userData.id)
//       : new Array(props.post.likeCount).fill("1"),
//     forwards: [],
//     sourceIcon: userProfilePageData.profilePicture,
//     linkCreated: moment(props.post.createdAt).valueOf().toString(),
//     isUserPost: true,
//     userAddress: toChecksumAddress(props.post.authorAddress),
//     type: EFeedType.CC_ITEM,
//     sourceId: "",
//     ccPost: props.post,
//   };

//   const [isShowCommentList, setIsShowCommentList] = useState<
//     Map<string, boolean>
//   >(new Map());

//   const toggleCommentList = (key: string) => {
//     const updated = new Map(isShowCommentList);

//     updated.set(key, !isShowCommentList.get(key));
//     setIsShowCommentList(updated);
//   };

//   return (
//     <>
//       {props.level == 0 && (
//         <GridFeed article={obj} type={EFeedType.CC_ITEM}>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "flex-start",
//               marginTop: "1rem",
//             }}
//           >
//             <LikeButton post={props.post} updateCC={props.updateCC} />
//             <div
//               style={{
//                 cursor: "pointer",
//                 marginLeft: "2rem",
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggleCommentInputBlock(props.post.contentID);
//               }}
//             >
//               <i
//                 style={{
//                   fontSize: "1.6rem",
//                   fontWeight: 500,
//                   margin: "0 2rem 0 .5rem",
//                 }}
//                 className="fa fa-comment-o"
//                 aria-hidden="true"
//               />
//               {isShowCommentInputBlock.get(props.post.contentID) ? (
//                 <CommentBox
//                   contentId={props.post.contentID}
//                   address={myAddress}
//                   fetchData={props.updateCC}
//                 />
//               ) : null}
//             </div>
//             {props.post.comments &&
//             props.post.comments.length > 0 &&
//             !isShowCommentList.get(props.post.contentID) ? (
//               <div
//                 style={{
//                   marginRight: "2rem",
//                   fontSize: "1.4rem",
//                   cursor: "pointer",
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   toggleCommentList(props.post.contentID);
//                 }}
//               >
//                 More ({props.post.comments.length})
//               </div>
//             ) : null}
//           </div>
//         </GridFeed>
//       )}
//       <div>
//         {props.level !== 0 && (
//           <div
//             style={{
//               fontSize: "1.4rem",
//               margin: "2rem 0",
//             }}
//           >
//             {props.post.body}
//           </div>
//         )}
//         {props.level !== 0 && (
//           <div
//             style={{ display: "flex" }}
//             onClick={(e) => {
//               e.stopPropagation();
//               toggleCommentInputBlock(props.post.contentID);
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 cursor: "pointer",
//               }}
//             >
//               {/* <div>Comment</div> */}
//               <i
//                 style={{
//                   fontSize: "1.6rem",
//                   fontWeight: 500,
//                   margin: "0 2rem 0 .5rem",
//                 }}
//                 className="fa fa-comment-o"
//                 aria-hidden="true"
//               />
//             </div>
//             {props.post.comments &&
//             props.post.comments.length > 0 &&
//             !isShowCommentList.get(props.post.contentID) ? (
//               <div
//                 style={{
//                   marginRight: "2rem",
//                   fontSize: "1.4rem",
//                   cursor: "pointer",
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   toggleCommentList(props.post.contentID);
//                 }}
//               >
//                 More ({props.post.comments.length})
//               </div>
//             ) : null}
//           </div>
//         )}
//         {isShowCommentInputBlock.get(props.post.contentID) &&
//         props.level !== 0 ? (
//           <CommentBox
//             contentId={props.post.contentID}
//             address={myAddress}
//             fetchData={props.updateCC}
//           />
//         ) : null}
//         {/* {isShowCommentList.get(post.contentID) ? (
//           <div>
//             {post.comments.map((comment) => (
//               <div
//                 key={post.contentID}
//                 style={{
//                   borderLeft: "solid .2rem #eee",
//                   boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
//                   padding: "1rem 2rem",
//                   marginTop: "2rem",
//                 }}
//               >
//                 {renderPostOrComment(comment, level + 1)}
//               </div>
//             ))}
//           </div>
//         ) : null} */}
//         {props.post.comments &&
//         props.post.comments.length > 0 &&
//         isShowCommentList.get(props.post.contentID) ? (
//           <div
//             style={{
//               position: "absolute",
//               zIndex: 100,
//               height: "40rem",
//               overflow: "scroll",
//               backgroundColor: "white",
//               width: "100%",
//               border: "solid .1rem lightgrey",
//               padding: "3rem 1.4rem",
//               borderRadius: ".5rem",
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 right: "1rem",
//                 top: "1rem",
//                 fontSize: "1.6rem",
//                 cursor: "pointer",
//               }}
//               onClick={(e) => {
//                 toggleCommentList(props.post.contentID);
//                 e.stopPropagation();
//               }}
//             >
//               x
//             </div>
//             {props.post.comments.map((comment) => (
//               <div
//                 key={props.post.contentID}
//                 style={{
//                   borderLeft: "solid .2rem #eee",
//                   boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
//                   padding: "1rem 2rem",
//                   marginTop: "2rem",
//                 }}
//               >
//                 <RenderPostOrComment
//                   post={comment}
//                   level={props.level + 1}
//                   updateCC={props.updateCC}
//                 />
//                 {/* {renderPostOrComment(comment, props.level + 1)} */}
//               </div>
//             ))}
//           </div>
//         ) : null}
//       </div>
//     </>
//   );
// };
