import { EFeedType } from "../homePage/horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import {
  updateCommentListType,
  updateCurrentCheckingCommentParentId,
} from "@/redux/globalSlice";
import { useState } from "react";
import moment from "moment";
import { toChecksumAddress } from "ethereum-checksum-address";

import { IPostProps } from "@/pages";
import GridFeed from "../homePage/gridFeed";
import CommentBox from "./cyberConnectCommentBox";
import LikeButton from "./cyberConnectLikeButton";

interface ICyberConnectGridFeedProps extends IPostProps {}

const CyberConnectGridPost = (props: ICyberConnectGridFeedProps) => {
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
    itemTitle: props.item.body,
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
    type: EFeedType.CC_ITEM,
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
    <GridFeed item={obj}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginTop: "1rem",
        }}
      >
        <LikeButton post={props.item} updateCC={props.updateList} />
        <div
          style={{
            cursor: "pointer",
            marginLeft: "2rem",
          }}
          onClick={(e) => {
            e.stopPropagation();
            toggleCommentInputBlock(props.item.id);
          }}
        >
          <i
            style={{
              fontSize: "1.6rem",
              fontWeight: 500,
              margin: "0 2rem 0 .5rem",
            }}
            className="fa fa-pencil"
            aria-hidden="true"
          ></i>
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
            style={{
              marginRight: "2rem",
              fontSize: "1.4rem",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              const arr = JSON.parse(
                JSON.stringify(currentCheckingCommentParentId)
              );

              if (arr.includes(props.item.id)) {
                return;
              }
              arr.push(props.item.id);

              dispatch(updateCommentListType(EFeedType.CC_ITEM));
              dispatch(updateCurrentCheckingCommentParentId(arr));
              toggleCommentList(props.item.id);
            }}
          >
            <i
              style={{
                marginRight: ".5rem",
                fontSize: "1.4rem",
                cursor: "pointer",
              }}
              className="fa fa-comments"
              aria-hidden="true"
            ></i>
            ({props.item.comments.length})
          </div>
        ) : null}
      </div>
    </GridFeed>
  );
};

export default CyberConnectGridPost;
