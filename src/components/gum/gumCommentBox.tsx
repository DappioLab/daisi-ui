import style from "@/styles/gum/gumCommentBox.module.sass";
import { useState } from "react";
import { ipfsClient, mainGateway } from "./gumStorage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface IGumCommentBoxProps {
  post: string;
}

const GumCommentBox = (props: IGumCommentBoxProps) => {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const sdk = useGumSDK();
  const wallet = useWallet();
  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const handleReply = async () => {
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
        new PublicKey(props.post),
        mainGateway + replyUrl.path,
        userProfile.profile,
        userProfile.user,
        wallet.publicKey
      )
    ).instructionMethodBuilder.rpc();
    console.log(replyTx);
    setOpen(false);
  };

  return (
    <div className={style.gumCommentBox}>
      <textarea
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          setReply(e.target.value);
        }}
        itemType="text"
        placeholder="Leave some comment"
        className={style.inputBlock}
      />
      <div>
        <button
          className={style.submitBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleReply();
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default GumCommentBox;
