import { useState } from "react";
import { ReplyInterface } from "./gumState";
import { ipfsClient, mainGateway } from "./storage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import style from "@/styles/gumPage/post.module.sass";
import ReplyForm from "./ReplyForm";
interface replyState {
  replies: ReplyInterface[];
  postPubkey: string;
}

const Replylist = (replies: replyState) => {
  const { replyMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  return (
    <>
      {replies.replies &&
        replies.replies.map((reply) => {
          return (
            <div key={reply.cl_pubkey.toString()} className={style.replyform}>
              <div className={style.reply}>{reply.text}</div>
              <ReplyForm
                from={reply.from.toString()}
                post={reply.cl_pubkey.toString()}
                type="Reply"
              ></ReplyForm>
              <Replylist
                replies={replyMap.get(reply.cl_pubkey.toString())}
                postPubkey={reply.cl_pubkey.toString()}
              ></Replylist>
            </div>
          );
        })}
    </>
  );
};

export default Replylist;
