import { ReplyInterface } from "./gumState";
import { useState } from "react";

import { ipfsClient, mainGateway } from "./storage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import style from "@/styles/gumPage/post.module.sass";
import DeleteButton from "./DeleteButton";
interface replyProp {
  from: string;
  post: string;
  type: string;
}
const ReplyForm = (prop: replyProp) => {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const sdk = useGumSDK();
  const wallet = useWallet();
  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  const handleReply = async (e: any) => {
    let data: any = {
      content: { content: reply },
      type: "text",
      authorship: {
        signature: "0",
        publicKey: "0",
      },
      contentDigest: "0",
      signatureEncoding: "base64",
      digestEncoding: "hex",
      parentDigest: "",
    };
    let replyUrl = await ipfsClient.add(JSON.stringify(data));
    let replyTx = await (
      await sdk.post.reply(
        new PublicKey(prop.post),
        mainGateway + replyUrl.path,
        userProfile.profile,
        userProfile.user,
        wallet.publicKey
      )
    ).instructionMethodBuilder.rpc();
    console.log(replyTx);
    setOpen(false);
  };
  let replyForm = null;
  if (open) {
    replyForm = (
      <div>
        <form>
          <textarea
            onChange={(e) => setReply(e.target.value)}
            itemType="text"
            placeholder="Reply"
            className={style.replyform}
          ></textarea>
        </form>
        <button onClick={handleReply}>Submit</button>
      </div>
    );
  }
  return (
    <>
      <DeleteButton
        from={prop.from}
        post={prop.post}
        type={prop.type}
      ></DeleteButton>
      <div>
        <button
          onClick={() => {
            setOpen(open ? false : true);
          }}
        >
          {"Reply to " + prop.type}
        </button>
        {replyForm}
      </div>
    </>
  );
};
export default ReplyForm;
