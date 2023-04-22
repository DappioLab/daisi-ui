import { useState } from "react";
import { ipfsClient, mainGateway } from "./gumStorage";
import { useGumSDK } from "@/hooks/useGumSDK";
import { IRootState } from "@/redux/index";
import { useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface IReplyFormProps {
  from: string;
  post: string;
  type: string;
  commentsNumber: number;
  postKey: string;
}

const ReplyForm = (props: IReplyFormProps) => {
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
  // let replyForm = null;
  // if (open) {
  //   replyForm = (
  //     <div>
  //       <form>
  //         <textarea
  //           onClick={(e) => e.stopPropagation()}
  //           onChange={(e) => {
  //             setReply(e.target.value);
  //           }}
  //           itemType="text"
  //           placeholder="Reply"
  //           className={style.replyform}
  //         ></textarea>
  //       </form>
  //       <button
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           handleReply();
  //         }}
  //       >
  //         Submit
  //       </button>
  //     </div>
  //   );
  // }

  // const handleDelete = async () => {
  //   try {
  //     if (!wallet.publicKey) {
  //       throw "wallet Not Connected";
  //     }
  //     let deleteTx = await sdk?.post
  //       .delete(
  //         new PublicKey(props.post),
  //         new PublicKey(userProfile.profile),
  //         new PublicKey(userProfile.user),
  //         wallet.publicKey
  //       )
  //       ?.rpc();
  //     window.location.reload();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{ display: "flex" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <i
              style={{
                fontSize: "1.6rem",
                fontWeight: 500,
                margin: "0 2rem 0 .5rem",
              }}
              className="fa fa-pencil"
              aria-hidden="true"
            ></i>
            {/* <div>Comment</div> */}
            {/* <i
              style={{
                fontSize: "1.6rem",
                fontWeight: 500,
                margin: "0 2rem 0 .5rem",
              }}
              className="fa fa-comment-o"
              aria-hidden="true"
            /> */}
          </div>
        </div>
        {/* {props.showMoreCommentBtn ? (
          <div
            style={{
              marginRight: "2rem",
              fontSize: "1.4rem",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              props.getListPostKey(props.postKey);
            }}
          >
            More ({props.commentsNumber})
          </div>
        ) : null} */}
        {/* ********* Delete post ******** */}
        {/* {userProfile && userProfile.profile.toString() == props.from && (
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <div>Delete</div>
            <i
              style={{
                fontSize: "1.6rem",
                fontWeight: 500,
                margin: "0 2rem 0 .5rem",
              }}
              className="fa fa-trash-o"
              aria-hidden="true"
            ></i>
          </div>
        )} */}
      </div>
      {/* {open && (
        <div
          style={{
            fontSize: "1.6rem",
            fontWeight: 500,
            marginTop: "1.5rem",
            display: "flex",
            // flexDirection: "column",
            alignItems: "flex-end",
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
      )} */}
    </div>
  );
};
export default ReplyForm;
