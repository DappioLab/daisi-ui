import { ISubmitModal } from "@/components/common/submitModal";
import { EPostType } from "@/pages";
import { IUser } from "@/pages/profile";
import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { IPostList } from "./discoverSlice";

export enum EPostModalType {
  DISCOVER_ITEM = 1,
  PROFILE_CC = 2,
  PROFILE_GUM = 3,
}

export interface IGlobalInitialState {
  submitModalData: ISubmitModal;
  isLogin: boolean;
  isLoading: boolean;
  userData: IUser | null;
  showAuthModal: boolean;
  showSubmitModal: boolean;
  currentAddress: string | null;
  screenWidth: number | null;
  userProfilePageHandle: PublicKey | null;
  userProfilePageData: IUser;

  // Post Modal
  showPostModal: boolean;
  postModalIndex: number | null;
  postModalData: IPostList | null;
  postModalType: EPostModalType | null;

  eventNotificationQueue: string[];
  commentListType: EPostType;
  currentCheckingCommentParentId: string[];
  showCommentListModal: boolean;
}

const initialState: IGlobalInitialState = {
  showSubmitModal: false,
  submitModalData: {
    title: "",
    description: "",
    link: "",
  },
  userData: {
    id: "",
    username: "",
    description: "",
    profilePicture: "/logo.png",
    address: "",
    createdAt: "",
    followers: [],
    followings: [],
  },
  isLogin: false,
  isLoading: false,
  showAuthModal: false,
  currentAddress: null,
  screenWidth: null,
  userProfilePageHandle: null,
  userProfilePageData: null,
  showPostModal: false,
  postModalIndex: null,
  postModalData: null,
  postModalType: null,
  eventNotificationQueue: [],
  commentListType: null,
  currentCheckingCommentParentId: [],
  showCommentListModal: false,
};

export const globalSlice = createSlice({
  name: "globalSlice",
  initialState,
  reducers: {
    updateSubmitModalData: (state, action) => {
      state.submitModalData = action.payload;
    },
    updateLoginStatus: (state, action) => {
      state.isLogin = action.payload;
    },
    updateUserData: (state, action) => {
      state.userData = action.payload;
    },
    updateAuthModal: (state, action) => {
      state.showAuthModal = action.payload;
    },
    updateShowSubmitModal: (state, action) => {
      state.showSubmitModal = action.payload;
    },
    updateCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    updateLoadingStatus: (state, action) => {
      state.isLoading = action.payload;
    },
    updateScreenWidth: (state, action) => {
      state.screenWidth = action.payload;
    },
    updateUserProfilePageHandle: (state, action) => {
      state.userProfilePageHandle = action.payload;
    },
    updateUserProfilePageData: (state, action) => {
      state.userProfilePageData = action.payload;
    },
    updateShowPostModal: (state, action) => {
      state.showPostModal = action.payload;
    },
    updatePostModalIndex: (state, action) => {
      state.postModalIndex = action.payload;
    },
    updatePostModalData: (state, action) => {
      state.postModalData = action.payload;
    },
    updatePostModalType: (state, action) => {
      state.postModalType = action.payload;
    },
    updateEventNotificationQueue: (state, action) => {
      state.eventNotificationQueue = action.payload;
    },
    updateCurrentCheckingCommentParentId: (state, action) => {
      state.currentCheckingCommentParentId = action.payload;
    },
    updateShowCommentListModal: (state, action) => {
      state.showCommentListModal = action.payload;
    },
    updateCommentListType: (state, action) => {
      state.commentListType = action.payload;
    },
  },
});

export const {
  updateSubmitModalData,
  updateLoginStatus,
  updateUserData,
  updateAuthModal,
  updateCurrentAddress,
  updateLoadingStatus,
  updateScreenWidth,
  updateShowSubmitModal,
  updateUserProfilePageHandle,
  updateUserProfilePageData,
  updateShowPostModal,
  updatePostModalIndex,
  updatePostModalData,
  updatePostModalType,
  updateEventNotificationQueue,
  updateCurrentCheckingCommentParentId,
  updateShowCommentListModal,
  updateCommentListType,
} = globalSlice.actions;

export default globalSlice.reducer;
