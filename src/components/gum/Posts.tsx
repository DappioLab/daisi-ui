import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
export interface postInterface {
  metadatauri: string;
  cl_pubkey: string;
  content: { blocks: string[] };
  type: string;
  title: string;
  description: string;
  image_url: string;
}
interface postState {
  post: postInterface;
  setData: Dispatch<SetStateAction<postInterface[]>>;
}

const Post = (post: postState) => {
  return <p>{JSON.stringify(post.post.content.blocks)}</p>;
};
export default Post;
