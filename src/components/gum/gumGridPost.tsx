import { IPostProps } from "@/pages";
import { IRootState } from "@/redux";
import {
  updateCommentListType,
  updateCurrentCheckingCommentParentId,
} from "@/redux/globalSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GridFeed from "../homePage/gridFeed";
import GumLikeButton from "../homePage/gumLikeButton";
import { EFeedType } from "../homePage/horizontalFeed";
import GumCommentBox from "./gumCommentBox";

interface IGumGridPostProps extends IPostProps {}

const GumGridPost = (props: IGumGridPostProps) => {
  const { currentCheckingCommentParentId } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { commentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const toggleCommentInputBlock = (key: string) => {
    const updated = new Map(isShowCommentInputBlock);

    updated.set(key, !isShowCommentInputBlock.get(key));
    setIsShowCommentInputBlock(updated);
  };

  const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
    Map<string, boolean>
  >(new Map());

  const dispatch = useDispatch();
  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };

  return (
    <GridFeed item={props.item}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginTop: "1rem",
        }}
      >
        <GumLikeButton
          post={props.item.gumPost}
          updateList={props.updateList}
        />
        {commentMap.size > 0 && (
          <>
            <div
              style={{
                cursor: "pointer",
                marginLeft: "2rem",
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentInputBlock(
                  props.item.gumPost.cl_pubkey.toString()
                );
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
              {isShowCommentInputBlock.get(
                props.item.gumPost.cl_pubkey.toString()
              ) && (
                <GumCommentBox post={props.item.gumPost.cl_pubkey.toString()} />
              )}
            </div>
            {commentMap.size > 0 &&
            commentMap.get(props.item.gumPost.cl_pubkey.toString()) ? (
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

                  if (arr.includes(props.item.gumPost.cl_pubkey.toString())) {
                    return;
                  }
                  arr.push(props.item.gumPost.cl_pubkey.toString());

                  dispatch(updateCommentListType(EFeedType.GUM_ITEM));
                  dispatch(updateCurrentCheckingCommentParentId(arr));
                  toggleCommentList(props.item.gumPost.cl_pubkey.toString());
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
                (
                {commentMap.get(props.item.gumPost.cl_pubkey.toString()).length}
                )
              </div>
            ) : null}
          </>
        )}
      </div>
    </GridFeed>
  );
};

export default GumGridPost;
