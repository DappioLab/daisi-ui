import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ReplyInterface } from "./gumState";
import { ipfsClient, mainGateway } from "./storage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import style from "@/styles/gumPage/post.module.sass";
import ReplyForm from "./ReplyFormMigrated";
import { cloneDeep } from "lodash";

interface IReplyListProps {
  replies: ReplyInterface[];
  postPubkey: string;
}

const ReplyList = (props: IReplyListProps) => {
  const { replyMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const [showCommentPostKey, setShowCommentPostKey] = useState<string[]>([]);

  const getListPostKey = (key: string) => {
    if (!replyMap.get(key)) {
      return;
    }

    if (!showCommentPostKey.includes(key)) {
      setShowCommentPostKey((old) => {
        let list = cloneDeep(old);
        list.push(key);
        return list;
      });
    }
  };

  return (
    <>
      {props.replies &&
        props.replies.map((reply) => {
          return (
            <div
              key={reply.cl_pubkey.toString()}
              style={{
                borderLeft: "solid .2rem #eee",
                boxShadow: "0rem .3rem .3rem rgba(0,0,0,.1)",
                padding: "1rem 2rem",
                marginTop: "2rem",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                {/* <div
                  style={{
                    border: ".2rem solid #eee",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "2rem", // padding width 2rem
                    // backgroundColor: "#eee",
                    transform: "translate(-100%, -100%)",
                    borderRadius: "0 0 0 .5rem",
                    borderTop: "none",
                    borderRight: "none",
                    // borderLeft: "none",
                  }}
                ></div> */}
                <div
                  style={{
                    fontSize: "1.4rem",
                    margin: "2rem 0",
                  }}
                >
                  {reply.text}
                </div>
              </div>
              {/* <div className={style.reply}>
                Reply number:{" "}
                {replyMap.get(reply.cl_pubkey.toString())
                  ? replyMap.get(reply.cl_pubkey.toString()).length
                  : 0}
              </div> */}
              {/* {replyMap.get(reply.cl_pubkey.toString()) &&
              replyMap.get(reply.cl_pubkey.toString()).length > 0 &&
              !showCommentPostKey.includes(reply.cl_pubkey.toString()) ? (
                <button
                  onClick={() => {
                    getListPostKey(reply.cl_pubkey.toString());
                  }}
                >
                  Show more
                </button>
              ) : null} */}
              {
                <>
                  <div style={{ margin: "1rem 0" }}>
                    <ReplyForm
                      from={reply.from.toString()}
                      post={reply.cl_pubkey.toString()}
                      type="Reply"
                      commentsNumber={
                        replyMap.get(reply.cl_pubkey.toString())
                          ? replyMap.get(reply.cl_pubkey.toString()).length
                          : 0
                      }
                      getListPostKey={getListPostKey}
                      postKey={reply.cl_pubkey.toString()}
                      showMoreCommentBtn={
                        !showCommentPostKey.includes(
                          reply.cl_pubkey.toString()
                        ) &&
                        replyMap.get(reply.cl_pubkey.toString()) &&
                        replyMap.get(reply.cl_pubkey.toString()).length > 0
                      }
                    />
                  </div>

                  {/* {!showCommentPostKey.includes(reply.cl_pubkey.toString()) &&
                  replyMap.get(reply.cl_pubkey.toString()) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        getListPostKey(reply.cl_pubkey.toString());
                      }}
                    >
                      Show comments
                    </button>
                  ) : null} */}
                  {replyMap.get(reply.cl_pubkey.toString()) &&
                  showCommentPostKey.includes(reply.cl_pubkey.toString()) ? (
                    <ReplyList
                      replies={replyMap.get(reply.cl_pubkey.toString())}
                      postPubkey={reply.cl_pubkey.toString()}
                    />
                  ) : null}
                </>
              }
            </div>
          );
        })}
    </>
  );
};

export default ReplyList;
