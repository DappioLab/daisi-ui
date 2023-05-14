import { EPostType } from "@/pages";
import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";

export interface IRssSourceData {
  id: string;
  sourceTitle: string;
  sourceDescription: string;
  sourceLink: string;
  sourceIcon: string;
}

export interface IRssSourceItem {
  id: string;
  itemTitle: string;
  itemDescription: string;
  itemLink: string;
  itemImage: string;
  created: string;
  likes: string[];
  forwards: string[];
  sourceIcon: string;
  linkCreated: string;
}

export interface IParsedRssData extends IRssSourceItem {
  source: IRssSourceData;
}

export interface IApiRssListResponse extends IRssSourceData {
  items: IRssSourceItem[];
}

export interface IDiscoverInitialState {
  postList: IPostList[];
}

export interface IPostList extends IRssSourceItem {
  type: EPostType;
  sourceId: string;
  isUserPost: boolean;
  userAddress: string;
  isLastItem?: boolean;
  cl_pubkey?: PublicKey; // gum need this for update
  gumPost?: any; // gum need this for update
  ccPost?: any; // cc need this for update
}

const initialState: IDiscoverInitialState = {
  postList: [],
};

export const discoverSlice = createSlice({
  name: "discoverSlice",
  initialState,
  reducers: {
    updatePostList: (state, action) => {
      state.postList = action.payload;
    },
  },
});

export const { updatePostList } = discoverSlice.actions;

export default discoverSlice.reducer;
