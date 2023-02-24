import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
import Block, { BlockInterface } from "./Block";
import style from "@/styles/gumPage/post.module.sass";
export interface postInterface {
  metadatauri: string;
  cl_pubkey: string;
  content: { blocks: BlockInterface[] };
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
  return (
    <div className={style.feed}>
      {post.post.content.blocks &&
        post.post.content.blocks.map((block: BlockInterface) => {
          return (
            <div key={block.id}>
              <Block block={block} />
            </div>
          );
        })}
    </div>
  );
};
export default Post;
