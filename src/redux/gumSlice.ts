import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { SDK } from "../gpl-core/src";
import {
  ConnectionInterface,
  ReactionInterface,
  ProfileAccount,
  ReplyInterface,
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
  allUser: Map<string, ProfileAccount>;
  followingMap: Map<string, ProfileAccount[]>;
  followersMap: Map<string, ProfileAccount[]>;
  replyMap: Map<string, ReplyInterface[]>;
}

const initialState: IGumInitialState = {
  userProfile: null,
  userAccounts: [],
  following: [],
  followers: [],
  reactions: new Map<string, ReactionInterface[]>(),
  postList: null,
  allPosts: [],
  allUser: new Map<string, ProfileAccount>(),
  followersMap: new Map<string, ProfileAccount[]>(),
  followingMap: new Map<string, ProfileAccount[]>(),
  replyMap: new Map<string, ReplyInterface[]>(),
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
    updateAllUser: (
      state,
      action: { payload: Map<string, ProfileAccount> }
    ) => {
      state.allUser = action.payload;
    },
    updateAllFollow: (
      state,
      action: {
        payload: {
          following: Map<string, ProfileAccount[]>;
          followers: Map<string, ProfileAccount[]>;
        };
      }
    ) => {
      state.followersMap = action.payload.following;
      state.followingMap = action.payload.followers;
    },
    updateReplies: (
      state,
      action: {
        payload: Map<string, ReplyInterface[]>;
      }
    ) => {
      state.replyMap = action.payload;
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
  updateAllUser,
  updateAllFollow,
  updateReplies,
} = gumSlice.actions;

export default gumSlice.reducer;
