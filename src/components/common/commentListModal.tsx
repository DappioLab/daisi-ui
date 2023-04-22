import { IRootState } from "@/redux";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Post } from "../cyberConnect/cyberConnectPostList";
import style from "@/styles/common/commentListModal.module.sass";
import {
  updateCurrentCheckingCommentParentId,
  updateShowCommentListModal,
} from "@/redux/globalSlice";
import CommentBox from "../cyberConnect/cyberConnectCommentBox";
import { EFeedType } from "../homePage/horizontalFeed";

interface ICommentListModalProps {
  list: any;
}

const CommentListModal = (props: ICommentListModalProps) => {
  const dispatch = useDispatch();
  const { currentCheckingCommentParentId, commentListType } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { commentMap, address } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );

  return (
    <div className={style.commentListModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updateShowCommentListModal(false));
        }}
      />
      <div className={style.modalContainer}>
        {currentCheckingCommentParentId.length > 1 && (
          <div
            className={style.backBtn}
            onClick={() => {
              const arr = JSON.parse(
                JSON.stringify(currentCheckingCommentParentId)
              );
              arr.pop();
              dispatch(updateCurrentCheckingCommentParentId(arr));
            }}
          >
            <i className="fa fa-arrow-left" aria-hidden="true"></i>
          </div>
        )}
        {props.list.map((item) => {
          return (
            <div className={style.commentItem}>
              <div className={style.content}>{item.body}</div>
              {
                <CommentBox
                  contentId={item.id}
                  address={address}
                  fetchData={async () => {}}
                />
              }
              {item.comments.length > 0 && (
                <div
                  className={style.moreBtn}
                  onClick={() => {
                    const arr = JSON.parse(
                      JSON.stringify(currentCheckingCommentParentId)
                    );

                    arr.push(item.contentID);
                    dispatch(updateCurrentCheckingCommentParentId(arr));
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
                  ({item.comments.length})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommentListModal;
