import { IAuthData, IAuthModal } from "@/components/common/authModal";
import { ISubmitModalProps } from "@/components/common/submitModal";
import { IUser } from "@/pages/profile/[address]";
import { createSlice } from "@reduxjs/toolkit";

export interface IGlobalInitialState {
  submitModalData: ISubmitModalProps;
  isLogin: boolean;
  isLoading: boolean;
  userData: IUser | null;
  showAuthModal: boolean;
  currentAddress: string | null;
}

const initialState: IGlobalInitialState = {
  submitModalData: {
    showSubmitModal: false,
    title: "",
    description: "",
  },
  userData: {
    id: "",
    username: "",
    description: "",
    profilePicture: "/avatar.jpeg",
    address: "",
    createdAt: "",
    followers: [],
    followings: [],
  },
  isLogin: false,
  isLoading: false,
  showAuthModal: false,
  currentAddress: null,
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
    updateCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    updateLoadingStatus: (state, action) => {
      state.isLoading = action.payload;
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
} = globalSlice.actions;

export default globalSlice.reducer;
