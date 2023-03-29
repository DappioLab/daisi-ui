import style from "@/styles/homePage/gridFeedList.module.sass";
import HorizontalFeed, { EFeedType } from "./horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { IRootState } from "@/redux";
import GridFeed from "./gridFeed";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
} from "@/redux/globalSlice";
import GumLikeButton from "./gumLikeButton";
import ReplyForm from "../gumPage/ReplyFormMigrated";
import ReplyList from "../gumPage/ReplyListMigrated";

interface IFeedList {
  // setShowModal: Dispatch<SetStateAction<boolean>>;
  // getPost: (id: string) => Promise<void>;
  // getCurrentModalIndex: (index: number) => number;
  // setPostModalIndex: Dispatch<SetStateAction<number | null>>;
  updateList: () => void;
}

const GridFeedList = (props: IFeedList) => {
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

  const getListPostKey = (key: string) => {
    const clone = new Map(isShowCommentList);
    const oldValue = clone.get(key);
    clone.set(key, !oldValue);
    setIsShowCommentList(clone);
  };

  return (
    <div className={style.feedList}>
      {feedList.map((item, index) => {
        return (
          <div
            style={{ position: "relative" }}
            key={`${index}`}
            onClick={() => {
              dispatch(updateFeedModalType(EFeedModalType.DISCOVER_ITEM));
              dispatch(updateFeedModalIndex(index));
              dispatch(updateShowFeedModal(true));
            }}
          >
            <GridFeed article={item} type={item.type}>
              {item.type === EFeedType.GUM_ITEM && (
                <div className={style.btnBlock}>
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
                      getListPostKey={getListPostKey}
                      postKey={item.gumPost.cl_pubkey.toString()}
                      showMoreCommentBtn={
                        replyMap.get(item.gumPost.cl_pubkey.toString()) &&
                        replyMap.get(item.gumPost.cl_pubkey.toString()).length >
                          0 &&
                        !isShowCommentList.get(item.id)
                      }
                    />
                  )}
                </div>
              )}
            </GridFeed>
            {replyMap.size > 0 &&
            item.type === EFeedType.GUM_ITEM &&
            isShowCommentList.size > 0 &&
            isShowCommentList.get(item.id) ? (
              <div
                style={{
                  position: "absolute",
                  zIndex: 100,
                  height: "40rem",
                  overflow: "scroll",
                  backgroundColor: "white",
                  width: "100%",
                  border: "solid .1rem lightgrey",
                  padding: "3rem 1.4rem",
                  borderRadius: ".5rem",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "1rem",
                    fontSize: "1.6rem",
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    getListPostKey(item.id);
                    e.stopPropagation();
                  }}
                >
                  x
                </div>
                <ReplyList
                  replies={replyMap.get(item.gumPost.cl_pubkey.toString())}
                  postPubkey={item.gumPost.cl_pubkey.toString()}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export default GridFeedList;
