import { createSlice } from "@reduxjs/toolkit";
import { IParsedRssData } from "./dailySlice";

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
  postList: IParsedRssData[];
}

const initialState: ICyberConnectInitialState = {
  address: null,
  accessToken: null,
  profile: null,
  lastPostsUpdateTime: new Date(),
  postList: [],
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
    updatePostList(state, action) {
      state.postList = state.postList.map((post) =>
        post.id == action.payload.id ? action.payload : post
      );
    },
  },
});

export const {
  setAddress,
  setAccessToken,
  setProfile,
  setLastPostsUpdateTime,
  setPostList,
  // updatePostList,
} = cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
