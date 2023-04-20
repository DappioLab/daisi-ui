import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import {
  ConnectionInterface,
  ReactionInterface,
  ProfileAccount,
  ReplyInterface,
} from "@/components/gum/useGumState";
import { IFeedList } from "./dailySlice";
import { postInterface } from "@/components/gum/gumPostList";

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
  commentMap: Map<string, ReplyInterface[]>;
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
  commentMap: new Map<string, ReplyInterface[]>(),
};

export const gumSlice = createSlice({
  name: "gumSlice",
  initialState,
  reducers: {
    updateUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    updateUserAccounts: (state, action) => {
      state.userAccounts = action.payload;
    },

    updateFollowing: (state, action) => {
      state.following = action.payload;
    },
    updateFollowers: (state, action) => {
      state.followers = action.payload;
    },
    updateReactions: (state, action) => {
      state.reactions = action.payload;
    },
    updatePostList: (state, action) => {
      state.postList = action.payload;
    },
    updatePosts: (state, action) => {
      state.allPosts = action.payload;
    },
    updateAllUser: (state, action) => {
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
    updateCommentMap: (state, action) => {
      state.commentMap = action.payload;
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
  updateCommentMap,
} = gumSlice.actions;

export default gumSlice.reducer;
