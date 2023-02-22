import { useEffect } from "react";
import React, { Dispatch, SetStateAction, useState } from "react";
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
  setData: Dispatch<SetStateAction<BlockInterface[]>>;
}
const Block = (block: blockState) => {
  useEffect(() => {
    const fetchData = async () => {};

    fetchData();
  }, [block.block.data]);
};
