import style from "@/styles/cyberConnect/cyberConnectGridPost.module.sass";
import moment from "moment";
import BaseGridPost from "../homePage/baseGridPost";
import CommentBox from "./cyberConnectCommentBox";
import LikeButton from "./cyberConnectLikeButton";
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

interface ICyberConnectGridPostProps extends IPostProps {}

const CyberConnectGridPost = (props: ICyberConnectGridPostProps) => {
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
    id: props.item.id,
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
    <BaseGridPost item={obj} updateList={props.updateList}>
      <div className={style.cyberConnectGridPost}>
        <LikeButton post={props.item} updateCC={props.updateList} />
        <div
          className={style.commentBlock}
          onClick={(e) => {
            e.stopPropagation();
            toggleCommentInputBlock(props.item.id);
          }}
        >
          <i className={`fa fa-pencil ${style.icon}`} aria-hidden="true" />
          {isShowCommentInputBlock.get(props.item.id) && (
            <CommentBox
              contentId={props.item.id}
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

              if (arr.includes(props.item.id)) {
                return;
              }
              arr.push(props.item.id);

              dispatch(updateCommentListType(EPostType.CC_ITEM));
              dispatch(updateCurrentCheckingCommentParentId(arr));
              toggleCommentList(props.item.id);
            }}
          >
            <i className={`fa fa-comments ${style.icon}`} aria-hidden="true" />(
            {props.item.comments.length})
          </div>
        ) : null}
      </div>
    </BaseGridPost>
  );
};

export default CyberConnectGridPost;
