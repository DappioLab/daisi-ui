import style from "@/styles/cyberConnect/cyberConnectCommentBox.module.sass";
import { useState } from "react";
import {
  checkNetwork,
  comment,
  connectWallet,
  createCyberConnectClient,
} from "@/utils/cyberConnect";

interface ICyberConnectCommentBoxProps {
  contentId: string;
  address: string;
  fetchData: () => void;
}

const CyberConnectCommentBox = (props: ICyberConnectCommentBoxProps) => {
  const [message, setMessage] = useState("");

  const handleOnClick = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);

      await comment(
        props.contentId,
        message,
        props.address,
        cyberConnectClient
      );

      alert("Post comment successfully");
      setMessage("");
      await props.fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={style.cyberConnectCommentBox}>
      <textarea
        className={style.inputBlock}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setMessage(e.target.value)}
        itemType="text"
        placeholder="Leave some comment"
      />
      <div>
        <button
          className={style.submitBtn}
          onClick={(e) => {
            e.stopPropagation();
            handleOnClick();
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CyberConnectCommentBox;
