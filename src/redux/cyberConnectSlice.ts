import { createSlice } from "@reduxjs/toolkit";
import { IPostList } from "./discoverSlice";

export interface Post {
  contentID: string;
  authorHandle: string;
  authorAddress: string;
  title: string;
  body: string;
  digest: string;
  arweaveTxHash: string;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
  likeCount: number;
  dislikeCount: number;
  likedStatus: {
    liked: boolean;
    disliked: boolean;
    proof: { arweaveTxHash: string | null };
  };
  comments: Post[];
}

export interface IProfile {
  profileID: number;
  handle: string;
  avatar: string;
  metadata: string;
}

export interface ICyberConnectInitialState {
  address: string | null;
  accessToken: string | null;
  profile: IProfile | null;
  lastPostsUpdateTime: Date;
  postList: IPostList[];
  commentMap: Map<string, Post[]>;
}

const initialState: ICyberConnectInitialState = {
  address: null,
  accessToken: null,
  profile: null,
  lastPostsUpdateTime: new Date(),
  postList: [],
  commentMap: new Map(),
};

const cyberConnectSlice = createSlice({
  name: "cyberConnect",
  initialState,
  reducers: {
    setAddress(state, action) {
      state.address = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setLastPostsUpdateTime(state, action) {
      state.lastPostsUpdateTime = action.payload;
    },
    setPostList(state, action) {
      state.postList = action.payload;
    },
    setCommentMap(state, action) {
      state.commentMap = action.payload;
    },
  },
});

export const {
  setAddress,
  setAccessToken,
  setProfile,
  setLastPostsUpdateTime,
  setPostList,
  setCommentMap,
} = cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
