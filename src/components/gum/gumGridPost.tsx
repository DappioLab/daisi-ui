import style from "@/styles/gum/gumGridPost.module.sass";
import BaseGridPost from "../homePage/baseGridPost";
import GumLikeButton from "./gumLikeButton";
import GumCommentBox from "./gumCommentBox";
import { IPostProps } from "@/pages";
import { IRootState } from "@/redux";
import {
  updateCommentListType,
  updateCurrentCheckingCommentParentId,
} from "@/redux/globalSlice";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EPostType } from "@/pages";

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
    <BaseGridPost item={props.item} updateList={props.updateList}>
      <div className={style.gumGridPost}>
        <GumLikeButton
          post={props.item.gumPost}
          updateList={props.updateList}
        />
        {commentMap.size > 0 && (
          <>
            <div
              className={style.commentBlock}
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentInputBlock(
                  props.item.gumPost.cl_pubkey.toString()
                );
              }}
            >
              <i className={`fa fa-pencil ${style.icon}`} aria-hidden="true" />
              {isShowCommentInputBlock.get(
                props.item.gumPost.cl_pubkey.toString()
              ) && (
                <GumCommentBox post={props.item.gumPost.cl_pubkey.toString()} />
              )}
            </div>
            {commentMap.size > 0 &&
            commentMap.get(props.item.gumPost.cl_pubkey.toString()) ? (
              <div
                className={style.commentsBlock}
                onClick={(e) => {
                  e.stopPropagation();
                  const arr = JSON.parse(
                    JSON.stringify(currentCheckingCommentParentId)
                  );

                  if (arr.includes(props.item.gumPost.cl_pubkey.toString())) {
                    return;
                  }
                  arr.push(props.item.gumPost.cl_pubkey.toString());

                  dispatch(updateCommentListType(EPostType.GUM_ITEM));
                  dispatch(updateCurrentCheckingCommentParentId(arr));
                  toggleCommentList(props.item.gumPost.cl_pubkey.toString());
                }}
              >
                <i
                  className={`fa fa-comments ${style.icon}`}
                  aria-hidden="true"
                />
                (
                {commentMap.get(props.item.gumPost.cl_pubkey.toString()).length}
                )
              </div>
            ) : null}
          </>
        )}
      </div>
    </BaseGridPost>
  );
};

export default GumGridPost;
