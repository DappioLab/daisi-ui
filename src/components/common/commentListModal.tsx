import style from "@/styles/common/commentListModal.module.sass";
import CommentBox from "../cyberConnect/cyberConnectCommentBox";
import { IRootState } from "@/redux";
import { useDispatch, useSelector } from "react-redux";
import {
  updateCurrentCheckingCommentParentId,
  updateShowCommentListModal,
} from "@/redux/globalSlice";

interface ICommentListModalProps {
  list: any;
}

const CommentListModal = (props: ICommentListModalProps) => {
  const dispatch = useDispatch();
  const { currentCheckingCommentParentId, commentListType } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const { address } = useSelector(
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
                    className={`fa fa-comments ${style.commentIcon}`}
                    aria-hidden="true"
                  />
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
