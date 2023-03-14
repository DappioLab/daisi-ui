import { useSelector } from "react-redux";
import { Content } from "@cyberlab/cyberconnect-v2/src/types";
import { IRootState } from "@/redux";
import { useState } from "react";
import { connectWallet, createCyberConnectClient } from "../helper";

const OffChainPost = () => {
  const { profile } = useSelector(
    (state: IRootState) => state.persistedReducer.cyberConnect
  );
  const [post, setPost] = useState<Omit<Content, "id">>({
    title: "",
    body: "",
    author: profile ? profile.handle : "",
  });

  const handleOnClick = async () => {
    try {
      if (!profile) {
        alert("Create a profile first, before post");
        return;
      }

      const provider = await connectWallet();
      const cyberConnectClient = createCyberConnectClient(provider);

      const res = await cyberConnectClient.createPost({
        ...post,
        author: profile.handle,
      });
      setPost({
        title: "",
        body: "",
        author: profile ? profile.handle : "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1>Post Title</h1>
      <input
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
        placeholder="Post Title"
      ></input>
      <h2>Content</h2>
      <textarea
        value={post.body}
        onChange={(e) => setPost({ ...post, body: e.target.value })}
        placeholder="What's your mood tody?"
      ></textarea>
      <button onClick={handleOnClick}>Post</button>
    </div>
  );
};

export default OffChainPost;
