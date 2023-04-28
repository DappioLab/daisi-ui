import React, { useState } from "react";
import {
  checkNetwork,
  comment,
  connectWallet,
  createCyberConnectClient,
} from "@/utils/cyberConnect";

interface CommentBoxProps {
  contentId: string;
  address: string;
  fetchData: () => void;
}

const CommentBox = (props: CommentBoxProps) => {
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
    <div>
      <div
        style={{
          fontSize: "1.6rem",
          fontWeight: 500,
          marginTop: "1.5rem",
        }}
      >
        <textarea
          style={{
            border: "solid 1px #eee",
            marginRight: "1rem",
            padding: "1rem",
            outline: "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setMessage(e.target.value)}
          itemType="text"
          placeholder="Leave some comment"
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
              handleOnClick();
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;
