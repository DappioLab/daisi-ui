// import { useEffect } from "react";
// import React, { useState } from "react";
// import { BlockInterface } from "./BlockMigrated";
// import style from "@/styles/gumPage/postMigrated.module.sass";
// import { PublicKey } from "@solana/web3.js";
// import { useDispatch, useSelector } from "react-redux";
// import { IRootState } from "@/redux";
// import { IFeedList } from "@/redux/dailySlice";
// import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
// import GridFeed from "../homePage/gridFeed";
// import {
//   EFeedModalType,
//   updateFeedModalIndex,
//   updateFeedModalType,
//   updateShowFeedModal,
// } from "@/redux/globalSlice";
// import moment from "moment";
// import ReplyList from "./ReplyListMigrated";
// import ReplyForm from "./ReplyFormMigrated";
// import GumLikeButton from "../homePage/gumLikeButton";

// export interface postInterface {
//   metadatauri: string;
//   daisiContent: {
//     itemTitle: string;
//     itemDescription: string;
//     itemLink: string;
//     itemImage: string;
//     created: Date;
//   };
//   cl_pubkey: PublicKey;
//   content: { blocks: BlockInterface[] };
//   type: string;
//   title: string;
//   description: string;
//   image_url: string;
//   profile: PublicKey;
// }

interface postState {
  //   post: postInterface;
  //   fetchPostData: () => Promise<void>;
  //   postIndex: number;
}

const Post = (post: postState) => {
  //   const dispatch = useDispatch();
  //   const { replyMap } = useSelector(
  //     (state: IRootState) => state.persistedReducer.gum
  //   );
  //   const { userProfilePageData, screenWidth } = useSelector(
  //     (state: IRootState) => state.persistedReducer.global
  //   );
  //   const [daisiContent, setDaisiContent] = useState<IFeedList | null>();

  //   useEffect(() => {
  //     const daisiContent = post.post.daisiContent;

  //     setDaisiContent({
  //       isUserPost: true,
  //       type: EFeedType.GUM_ITEM,
  //       sourceId: "",
  //       userAddress: "",
  //       id: "",
  //       itemTitle: daisiContent.itemTitle,
  //       itemDescription: daisiContent.itemDescription,
  //       itemLink: daisiContent.itemLink,
  //       itemImage: daisiContent.itemImage,
  //       created: moment(daisiContent.created).valueOf().toString(),
  //       likes: [],
  //       forwards: [],
  //       sourceIcon: userProfilePageData.profilePicture,
  //       linkCreated: moment(daisiContent.created).valueOf().toString(),
  //     });
  //   }, [post]);

  return (
    <div>Deprecated</div>
    // <div className={style.feed}>
    //   {daisiContent && (
    //     <>
    //       {screenWidth > 900 ? (
    //         <>
    //           <div
    //             onClick={() => {
    //               dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
    //               dispatch(updateFeedModalIndex(post.postIndex));
    //               dispatch(updateShowFeedModal(true));
    //             }}
    //           >
    //             <HorizontalFeed
    //               article={daisiContent}
    //               type={EFeedType.GUM_ITEM}
    //             >
    //               <div className={style.btnBlock}>
    //                 <div style={{ marginTop: "1rem", display: "flex" }}>
    //                   <div style={{ marginRight: "2rem", display: "flex" }}>
    //                     <GumLikeButton
    //                       post={post.post}
    //                       updateList={post.fetchPostData}
    //                     />{" "}
    //                   </div>
    //                   <ReplyForm
    //                     from={post.post.profile.toString()}
    //                     post={post.post.cl_pubkey.toString()}
    //                     type="Post"
    //                     commentsNumber={
    //                       replyMap.get(post.post.cl_pubkey.toString())
    //                         ? replyMap.get(post.post.cl_pubkey.toString())
    //                             .length
    //                         : 0
    //                     }
    //                     getListPostKey={() => {}}
    //                     postKey={post.post.cl_pubkey.toString()}
    //                     showMoreCommentBtn={false}
    //                   />
    //                 </div>
    //               </div>
    //             </HorizontalFeed>
    //           </div>
    //           <ReplyList
    //             replies={replyMap.get(post.post.cl_pubkey.toString())}
    //             postPubkey={post.post.cl_pubkey.toString()}
    //           />
    //         </>
    //       ) : (
    //         <div
    //           onClick={() => {
    //             dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
    //             dispatch(updateFeedModalIndex(post.postIndex));
    //             dispatch(updateShowFeedModal(true));
    //           }}
    //         >
    //           <GridFeed article={daisiContent} type={EFeedType.GUM_ITEM}>
    //             <div className={style.btnBlock}>
    //               <div style={{ marginTop: "1rem", display: "flex" }}>
    //                 <div style={{ marginRight: "2rem", display: "flex" }}>
    //                   <GumLikeButton
    //                     post={post.post}
    //                     updateList={post.fetchPostData}
    //                   />
    //                 </div>
    //                 <ReplyForm
    //                   from={post.post.profile.toString()}
    //                   post={post.post.cl_pubkey.toString()}
    //                   type="Post"
    //                   commentsNumber={
    //                     replyMap.get(post.post.cl_pubkey.toString())
    //                       ? replyMap.get(post.post.cl_pubkey.toString()).length
    //                       : 0
    //                   }
    //                   getListPostKey={() => {}}
    //                   postKey={post.post.cl_pubkey.toString()}
    //                   showMoreCommentBtn={false}
    //                 />
    //               </div>
    //             </div>
    //           </GridFeed>
    //           <ReplyList
    //             replies={replyMap.get(post.post.cl_pubkey.toString())}
    //             postPubkey={post.post.cl_pubkey.toString()}
    //           />
    //         </div>
    //       )}
    //     </>
    //   )}
    // </div>
  );
};

export default Post;
