import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { SDK } from "../gpl-core/src";
import {
  ConnectionInterface,
  ReactionInterface,
  ProfileAccount,
} from "@/components/gumPage/gumState";
import { IFeedList } from "./dailySlice";
import { postInterface } from "@/components/gumPage/Posts";
export interface IGumInitialState {
  userProfile: ProfileAccount | null;
  userAccounts: PublicKey[];
  following: ConnectionInterface[];
  followers: PublicKey[];
  reactions: Map<string, ReactionInterface[]>;
  postList: IFeedList[] | null;
  allPosts: postInterface[];
}

const initialState: IGumInitialState = {
  userProfile: null,
  userAccounts: [],
  following: [],
  followers: [],
  reactions: new Map<string, ReactionInterface[]>(),
  postList: null,
  allPosts: [],
};

export const gumSlice = createSlice({
  name: "gumSlice",
  initialState,
  reducers: {
    updateUserProfile: (
      state,
      action: {
        payload: ProfileAccount;
      }
    ) => {
      state.userProfile = action.payload;
    },
    updateUserAccounts: (
      state,
      action: {
        payload: PublicKey[];
      }
    ) => {
      state.userAccounts = action.payload;
    },

    updateFollowing: (state, action: { payload: ConnectionInterface[] }) => {
      state.following = action.payload;
    },
    updateFollowers: (state, action: { payload: PublicKey[] }) => {
      state.followers = action.payload;
    },
    updateReactions: (
      state,
      action: { payload: Map<string, ReactionInterface[]> }
    ) => {
      state.reactions = action.payload;
    },
    updatePostList: (state, action) => {
      state.postList = action.payload;
    },
    updatePosts: (state, action: { payload: postInterface[] }) => {
      state.allPosts = action.payload;
    },
  },
});

export const {
  updateUserAccounts,
  updateUserProfile,
  updateFollowing,
  updateFollowers,
  updateReactions,
  updatePostList,
  updatePosts,
} = gumSlice.actions;

export default gumSlice.reducer;
