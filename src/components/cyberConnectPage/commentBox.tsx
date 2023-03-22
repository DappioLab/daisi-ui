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
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleOnClick = async () => {
    try {
      const provider = await connectWallet();
      await checkNetwork(provider);
      const cyberConnectClient = createCyberConnectClient(provider);
      await comment(
        props.contentId,
        title,
        message,
        props.address,
        cyberConnectClient
      );
      await props.fetchData();

      setTitle("");
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h3>Title:</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Comment Title"
      />
      <h3>Content:</h3>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something here."
      />
      <button onClick={handleOnClick}>Comment</button>
    </div>
  );
};

export default CommentBox;
