import { IAuthData, IAuthModal } from "@/components/common/authModal";
import {
  ISubmitModal,
  ISubmitModalProps,
} from "@/components/common/submitModal";
import { IUser } from "@/pages/profile/[address]";
import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";

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
} = globalSlice.actions;

export default globalSlice.reducer;
