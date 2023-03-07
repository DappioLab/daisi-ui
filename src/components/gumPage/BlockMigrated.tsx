import style from "@/styles/gumPage/post.module.sass";
import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { CREATED_IN_DAISI_TAG } from "./Explore";
export interface BlockInterface {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: string;
    file?: { url: string };
    style: string;
  };
}

interface blockState {
  block: BlockInterface;
}
const Block = (block: blockState) => {
  useEffect(() => {
    const fetchData = async () => {};

    fetchData();
  }, [block.block.data]);

  if (block.block.data.text == CREATED_IN_DAISI_TAG) {
    return <div></div>;
  }

  if (block.block.data.file) {
    return (
      <div>
        <img
          src={block.block.data.file?.url}
          alt="icon"
          className={style.articleImage}
        />
        A
      </div>
    );
  } else if (block.block.data.text) {
    return <div className={style.text}>{block.block.data.text} B</div>;
  } else {
    return <div></div>;
  }
};
export default Block;
