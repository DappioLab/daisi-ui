import { Post } from "@/components/cyberConnect/cyberConnectPostList";
import { createSlice } from "@reduxjs/toolkit";
import { IFeedList } from "./dailySlice";

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
  postList: IFeedList[];
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
    // updatePostList(state, action) {
    //   state.postList = state.postList.map((post) =>
    //     post.id == action.payload.id ? action.payload : post
    //   );
    // },
    setCommentMap(state, action) {
      // @ts-ignore
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
  // updatePostList,
} = cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
