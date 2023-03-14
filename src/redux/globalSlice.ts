import { IAuthData, IAuthModal } from "@/components/common/authModal";
import {
  ISubmitModal,
  ISubmitModalProps,
} from "@/components/common/submitModal";
import { EFeedType } from "@/components/homePage/horizontalFeed";
import { IUser } from "@/pages/profile/[address]";
import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { IFeedList, IRssSourceItem } from "./dailySlice";

export enum EFeedModalType {
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
  showFeedModal: boolean;
  feedModalIndex: number | null;
  feedModalData: IFeedList | null;
  feedModalType: EFeedModalType | null;
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
  showFeedModal: false,
  feedModalIndex: null,
  feedModalData: null,
  feedModalType: null,
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
    updateShowFeedModal: (state, action) => {
      state.showFeedModal = action.payload;
    },
    updateFeedModalIndex: (state, action) => {
      state.feedModalIndex = action.payload;
    },
    updateFeedModalData: (state, action) => {
      state.feedModalData = action.payload;
    },
    updateFeedModalType: (state, action) => {
      state.feedModalType = action.payload;
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
  updateShowFeedModal,
  updateFeedModalIndex,
  updateFeedModalData,
  updateFeedModalType,
} = globalSlice.actions;

export default globalSlice.reducer;
