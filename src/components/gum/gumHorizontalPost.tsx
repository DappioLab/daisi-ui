import style from "@/styles/gum/gumHorizontalPost.module.sass";
import BaseHorizontalPost from "../homePage/baseHorizontalPost";
import GumLikeButton from "./gumLikeButton";
import GumCommentBox from "./gumCommentBox";
import { EPostType } from "@/pages";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { useEffect, useState } from "react";
import { IPostList } from "@/redux/discoverSlice";
import {
  updateCommentListType,
  updateCurrentCheckingCommentParentId,
} from "@/redux/globalSlice";

export interface IGumHorizontalPost {
  item: IPostList;
  updateList: () => void;
}

const GumHorizontalPost = (props: IGumHorizontalPost) => {
  const { postList } = useSelector(
    (state: IRootState) => state.persistedReducer.discover
  );
  const { commentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const dispatch = useDispatch();
  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  const { currentCheckingCommentParentId } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  const [isShowCommentInputBlock, setIsShowCommentInputBlock] = useState<
    Map<string, boolean>
  >(new Map());

  const toggleCommentInputBlock = (key: string) => {
    const updated = new Map(isShowCommentInputBlock);

    updated.set(key, !isShowCommentInputBlock.get(key));
    setIsShowCommentInputBlock(updated);
  };

  useEffect(() => {
    const isShowComment = new Map();
    postList.map((item) => {
      isShowComment.set(item.id, false);
    });

    setIsShowCommentList(() => isShowComment);
  }, [postList]);

  const toggleCommentList = (key: string) => {
    const updated = new Map(isShowCommentList);

    updated.set(key, !isShowCommentList.get(key));
    setIsShowCommentList(updated);
  };

  return (
    <BaseHorizontalPost item={props.item} updateList={props.updateList}>
      {props.item.type === EPostType.GUM_ITEM && (
        <div className={style.gumHorizontalPost}>
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
                <i
                  className={`fa fa-pencil ${style.icon}`}
                  aria-hidden="true"
                />
                {isShowCommentInputBlock.get(
                  props.item.gumPost.cl_pubkey.toString()
                ) && (
                  <GumCommentBox
                    post={props.item.gumPost.cl_pubkey.toString()}
                  />
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
                  {
                    commentMap.get(props.item.gumPost.cl_pubkey.toString())
                      .length
                  }
                  )
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </BaseHorizontalPost>
  );
};

export default GumHorizontalPost;
