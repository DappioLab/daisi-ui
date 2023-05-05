import moment from "moment";
import style from "@/styles/cyberConnect/cyberConnectHorizontalPost.module.sass";
import BaseHorizontalPost from "../homePage/baseHorizontalPost";
import LikeButton from "../cyberConnect/cyberConnectLikeButton";
import CommentBox from "../cyberConnect/cyberConnectCommentBox";
import { EPostType } from "@/pages";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import {
  updateCommentListType,
  updateCurrentCheckingCommentParentId,
} from "@/redux/globalSlice";
import { useState } from "react";
import { toChecksumAddress } from "ethereum-checksum-address";
import { IPostProps } from "@/pages";

export interface ICyberConnectHorizontalPost extends IPostProps {
  updateList: () => void;
}

const CyberConnectHorizontalPost = (props: ICyberConnectHorizontalPost) => {
  const { address: myAddress } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  const { userData, userProfilePageData, currentCheckingCommentParentId } =
    useSelector((state: IRootState) => state.persistedReducer.global);

  const toggleCommentInputBlock = (key: string) => {
    const updated = new Map(isShowCommentInputBlock);

    updated.set(key, !isShowCommentInputBlock.get(key));
    setIsShowCommentInputBlock(updated);
  };

  const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
    Map<string, boolean>
  >(new Map());

  const obj = {
    id: props.item.contentID,
    itemTitle: props.item.title,
    itemDescription: props.item.body.split("\n\n")[0],
    itemLink: props.item.body.split("\n\n").reverse()[0],
    itemImage: "",
    created: props.item.createdAt as unknown as string,
    likes: props.item.likedStatus.liked
      ? new Array(props.item.likeCount).fill(userData.id)
      : new Array(props.item.likeCount).fill("1"),
    forwards: [],
    sourceIcon: userProfilePageData.profilePicture,
    linkCreated: moment(props.item.createdAt).valueOf().toString(),
    isUserPost: true,
    userAddress: toChecksumAddress(props.item.authorAddress),
    type: EPostType.CC_ITEM,
    sourceId: "",
    ccPost: props.item,
  };

  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };
  const dispatch = useDispatch();

  return (
    <BaseHorizontalPost item={obj} updateList={props.updateList}>
      <div className={style.cyberConnectHorizontalPost}>
        <LikeButton post={props.item} updateCC={props.updateList} />
        <div
          className={style.commentBlock}
          onClick={(e) => {
            e.stopPropagation();
            toggleCommentInputBlock(props.item.contentID);
          }}
        >
          <i className={`fa fa-pencil ${style.icon}`} aria-hidden="true" />
          {isShowCommentInputBlock.get(props.item.contentID) && (
            <CommentBox
              contentId={props.item.contentID}
              address={myAddress}
              fetchData={props.updateList}
            />
          )}
        </div>
        {props.item.comments && props.item.comments.length > 0 ? (
          <div
            className={style.commentsBlock}
            onClick={(e) => {
              e.stopPropagation();
              const arr = JSON.parse(
                JSON.stringify(currentCheckingCommentParentId)
              );

              if (arr.includes(props.item.contentID)) {
                return;
              }

              arr.push(props.item.contentID);
              dispatch(updateCommentListType(EPostType.CC_ITEM));
              dispatch(updateCurrentCheckingCommentParentId(arr));
              toggleCommentList(props.item.contentID);
            }}
          >
            <i className={`fa fa-comments ${style.icon}`} aria-hidden="true" />(
            {props.item.comments.length})
          </div>
        ) : null}
      </div>
    </BaseHorizontalPost>
  );
};

export default CyberConnectHorizontalPost;
