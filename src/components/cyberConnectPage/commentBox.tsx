import React, { useState } from "react";
import {
  checkNetwork,
  comment,
  connectWallet,
  createCyberConnectClient,
} from "./helper";

interface CommentBoxProps {
  contentId: string;
  address: string;
  fetchData: () => Promise<void>;
}

const CommentBox = (props: CommentBoxProps) => {
  const [message, setMessage] = useState("");

  const handleOnClick = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);
      alert(message);
      await comment(
        props.contentId,
        message,
        props.address,
        cyberConnectClient
      );
      await props.fetchData();

      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* <h3>Content:</h3> */}
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
            outline: "none",

            // width: "30rem",
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
      {/* <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something here."
      />
      <button onClick={handleOnClick}>Comment</button> */}
    </div>
  );
};

export default CommentBox;
