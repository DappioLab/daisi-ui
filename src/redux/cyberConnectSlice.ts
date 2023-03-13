import { createSlice } from "@reduxjs/toolkit";
import { Web3Provider } from "@ethersproject/providers";
import { IPFSHTTPClient } from "ipfs-http-client";
import CyberConnect from "@cyberlab/cyberconnect-v2";
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
  provider: Web3Provider | null;
  profile: IProfile | null;
  cyberConnectClient: CyberConnect | null;
  ipfsClient: IPFSHTTPClient | null;
  lastPostsUpdateTime: Date;
  postList: IParsedRssData[];
}

const initialState: ICyberConnectInitialState = {
  address: null,
  accessToken: null,
  provider: null,
  profile: null,
  cyberConnectClient: null,
  ipfsClient: null,
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
    setProvider(state, action) {
      state.provider = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setCyberConnectClient(state, action) {
      state.cyberConnectClient = action.payload;
    },
    setIpfsClient(state, action) {
      state.ipfsClient = action.payload;
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
  setProvider,
  setAccessToken,
  setProfile,
  setCyberConnectClient,
  setIpfsClient,
  setLastPostsUpdateTime,
  setPostList,
  // updatePostList,
} = cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
