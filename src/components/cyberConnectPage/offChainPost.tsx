import CyberConnect, { Env } from "@cyberlab/cyberconnect-v2";
import { connectWallet } from "./helper/wallet";
import { useSelector } from "react-redux";
import { Content } from "@cyberlab/cyberconnect-v2/src/types";
import { IRootState } from "@/redux";
import { useState } from "react";

const OffChainPost = () => {
  const { provider, primaryProfile } = useSelector(
    (state: IRootState) => state.cyberConnect
  );
  const [post, setPost] = useState<Omit<Content, "id">>({
    title: "",
    body: "",
    author: primaryProfile ? primaryProfile.handle : "",
  });

  const handleOnClick = async () => {
    try {
      if (!primaryProfile) {
        alert("Create a profile first, before post");
        return;
      }

      const cyberConnect = new CyberConnect({
        namespace: "CyberConnect",
        env: "STAGING",
        provider: provider,
        signingMessageEntity: "CyberConnect",
      });
      const res = await cyberConnect.createPost({
        ...post,
        author: primaryProfile.handle,
      });
      setPost({
        title: "",
        body: "",
        author: primaryProfile ? primaryProfile.handle : "",
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
