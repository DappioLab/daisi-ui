import { IAuthData, IAuthModal } from "@/components/common/authModal";
import {
  ISubmitModal,
  ISubmitModalProps,
} from "@/components/common/submitModal";
import { IUser } from "@/pages/profile/[address]";
import { createSlice } from "@reduxjs/toolkit";

export interface IGlobalInitialState {
  submitModalData: ISubmitModal;
  isLogin: boolean;
  isLoading: boolean;
  userData: IUser | null;
  showAuthModal: boolean;
  showSubmitModal: boolean;
  currentAddress: string | null;
  screenWidth: number | null;
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
} = globalSlice.actions;

export default globalSlice.reducer;
