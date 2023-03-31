import style from "@/styles/homePage/horizontalFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import {
  EFeedModalType,
  updateAuthModal,
  updateFeedModalIndex,
  updateFeedModalType,
  updateLoadingStatus,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import { PublicKey } from "@solana/web3.js";
import { ReactionType } from "@/gpl-core/src/reaction";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { postInterface } from "../gumPage/Posts";
import { useEffect, useState } from "react";
import { updateReactions } from "@/redux/gumSlice";
import GumLikeButton from "./gumLikeButton";
import ReplyForm from "../gumPage/ReplyFormMigrated";
import ReplyList from "../gumPage/ReplyListMigrated";
import LikeButton from "../cyberConnectPage/likeButton";
import CommentBox from "../cyberConnectPage/commentBox";
import PostList from "../cyberConnectPage/postListMigrated";
import moment from "moment";
import { toChecksumAddress } from "ethereum-checksum-address";
import { Post } from "../cyberConnectPage/postList";

interface IFeedList {
  updateList: () => void;
  updateCC: () => Promise<void>;
}

const HorizontalFeedList = (props: IFeedList) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const { replyMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
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

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };

  return (
    <div className={style.horizontalFeedList}>
      {feedList.map((item, index) => {
        return (
          <div
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            <>
              {item.type === EFeedType.CC_ITEM ? (
                <RenderPostOrComment
                  post={item.ccPost}
                  updateCC={props.updateCC}
                  level={0}
                />
              ) : (
                <HorizontalFeed article={item} type={item.type}>
                  {item.type === EFeedType.GUM_ITEM && (
                    <>
                      <div style={{ marginRight: "2rem" }}>
                        <GumLikeButton
                          post={item.gumPost}
                          updateList={props.updateList}
                        />
                      </div>
                      {replyMap.size > 0 && (
                        <ReplyForm
                          from={item.gumPost.profile.toString()}
                          post={item.gumPost.cl_pubkey.toString()}
                          type="Post"
                          commentsNumber={
                            replyMap.get(item.gumPost.cl_pubkey.toString())
                              ? replyMap.get(item.gumPost.cl_pubkey.toString())
                                  .length
                              : 0
                          }
                          getListPostKey={toggleCommentList}
                          postKey={item.gumPost.cl_pubkey.toString()}
                          showMoreCommentBtn={
                            replyMap.get(item.gumPost.cl_pubkey.toString()) &&
                            replyMap.get(item.gumPost.cl_pubkey.toString())
                              .length > 0 &&
                            !isShowCommentList.get(item.id)
                          }
                        />
                      )}
                    </>
                  )}
                </HorizontalFeed>
              )}
              {item.type === EFeedType.GUM_ITEM && (
                <>
                  {replyMap.size > 0 &&
                  isShowCommentList.size > 0 &&
                  isShowCommentList.get(item.id) ? (
                    <ReplyList
                      replies={replyMap.get(item.gumPost.cl_pubkey.toString())}
                      postPubkey={item.gumPost.cl_pubkey.toString()}
                    />
                  ) : null}
                </>
              )}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalFeedList;

export interface IRenderPostOrComment {
  post: Post;
  level: number;
  updateCC: () => Promise<void>;
}

const RenderPostOrComment = (props: IRenderPostOrComment) => {
  const { address: myAddress } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  const { userData, userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  const toggleCommentInputBlock = (key: string) => {
    const updated = new Map(isShowCommentInputBlock);

    updated.set(key, !isShowCommentInputBlock.get(key));
    setIsShowCommentInputBlock(updated);
  };

  const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
    Map<string, boolean>
  >(new Map());

  const obj = {
    id: props.post.contentID,
    itemTitle: props.post.body,
    itemDescription: props.post.body.split("\n\n")[0],
    itemLink: props.post.body.split("\n\n").reverse()[0],
    itemImage: "",
    created: props.post.createdAt as unknown as string,
    likes: props.post.likedStatus.liked
      ? new Array(props.post.likeCount).fill(userData.id)
      : new Array(props.post.likeCount).fill("1"),
    forwards: [],
    sourceIcon: userProfilePageData.profilePicture,
    linkCreated: moment(props.post.createdAt).valueOf().toString(),
    isUserPost: true,
    userAddress: toChecksumAddress(props.post.authorAddress),
    type: EFeedType.CC_ITEM,
    sourceId: "",
    ccPost: props.post,
  };

  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };

  return (
    <>
      {props.level == 0 && (
        <HorizontalFeed article={obj} type={EFeedType.CC_ITEM}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginTop: "1rem",
            }}
          >
            <LikeButton post={props.post} updateCC={props.updateCC} />
            <div
              style={{
                cursor: "pointer",
                marginLeft: "2rem",
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentInputBlock(props.post.contentID);
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
              {isShowCommentInputBlock.get(props.post.contentID) ? (
                <CommentBox
                  contentId={props.post.contentID}
                  address={myAddress}
                  fetchData={props.updateCC}
                />
              ) : null}
            </div>
            {props.post.comments &&
            props.post.comments.length > 0 &&
            !isShowCommentList.get(props.post.contentID) ? (
              <div
                style={{
                  marginRight: "2rem",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCommentList(props.post.contentID);
                }}
              >
                More ({props.post.comments.length})
              </div>
            ) : null}
          </div>
        </HorizontalFeed>
      )}
      <div>
        {props.level !== 0 && (
          <div
            style={{
              fontSize: "1.4rem",
              margin: "2rem 0",
            }}
          >
            {props.post.body}
          </div>
        )}
        {props.level !== 0 && (
          <div
            style={{ display: "flex" }}
            onClick={(e) => {
              e.stopPropagation();
              toggleCommentInputBlock(props.post.contentID);
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
            {props.post.comments &&
            props.post.comments.length > 0 &&
            !isShowCommentList.get(props.post.contentID) ? (
              <div
                style={{
                  marginRight: "2rem",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCommentList(props.post.contentID);
                }}
              >
                More ({props.post.comments.length})
              </div>
            ) : null}
          </div>
        )}
        {isShowCommentInputBlock.get(props.post.contentID) &&
        props.level !== 0 ? (
          <CommentBox
            contentId={props.post.contentID}
            address={myAddress}
            fetchData={props.updateCC}
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
        {props.post.comments &&
        props.post.comments.length > 0 &&
        isShowCommentList.get(props.post.contentID) ? (
          <div>
            {props.post.comments.map((comment) => (
              <div
                key={props.post.contentID}
                style={{
                  borderLeft: "solid .2rem #eee",
                  boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
                  padding: "1rem 2rem",
                  marginTop: "2rem",
                  maxWidth: "66rem",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <RenderPostOrComment
                  post={comment}
                  level={props.level + 1}
                  updateCC={props.updateCC}
                />
                {/* {renderPostOrComment(comment, props.level + 1)} */}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};
