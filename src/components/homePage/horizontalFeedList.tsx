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

interface IFeedList {
  updateList: () => void;
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

  const getListPostKey = (key: string) => {
    const clone = new Map(isShowCommentList);
    clone.set(key, true);
    setIsShowCommentList(clone);
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
                        getListPostKey={getListPostKey}
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
              {replyMap.size > 0 &&
              item.type === EFeedType.GUM_ITEM &&
              isShowCommentList.size > 0 &&
              isShowCommentList.get(item.id) ? (
                <ReplyList
                  replies={replyMap.get(item.gumPost.cl_pubkey.toString())}
                  postPubkey={item.gumPost.cl_pubkey.toString()}
                />
              ) : null}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalFeedList;
