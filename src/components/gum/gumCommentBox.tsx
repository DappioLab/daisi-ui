import { useState } from "react";

import { ipfsClient, mainGateway } from "./gumStorage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import style from "@/styles/gumPage/post.module.sass";

interface IReplyFormProps {
  post: string;
}

const GumCommentBox = (props: IReplyFormProps) => {
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
    <div
      style={{
        fontSize: "1.6rem",
        fontWeight: 500,
        marginTop: "1.5rem",
        // display: "flex",
        // flexDirection: "column",
        // alignItems: "flex-end",
      }}
    >
      <textarea
        style={{
          border: "solid 1px #eee",
          marginRight: "1rem",
          padding: "1rem",
          // width: "30rem",
        }}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          setReply(e.target.value);
        }}
        itemType="text"
        placeholder="Leave some comment"
        className={style.replyform}
      />
      <div>
        <button
          style={{
            backgroundColor: "rgb(255, 203, 106)",
            color: "#333",
            padding: ".5rem 1.2rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            border: "none",
          }}
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
