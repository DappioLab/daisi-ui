import { IAuthModalProps } from "@/components/common/authModal";
import { ISubmitModalProps } from "@/components/common/submitModal";
import { createSlice } from "@reduxjs/toolkit";

export interface IUserData {
  name: string;
  id: string;
  bio: string;
  avatar: string;
  createdDate: string;
}

export interface IGlobalInitialState {
  submitModalData: ISubmitModalProps;
  isLogin: boolean;
  userData: IUserData | null;
  authModalData: IAuthModalProps;
}

const initialState: IGlobalInitialState = {
  submitModalData: {
    showSubmitModal: false,
    title: "",
    description: "",
  },
  isLogin: false,
  userData: {
    name: "Benson Name",
    id: "1",
    bio: "hello world, this is a bio example",
    avatar: "/avatar.jpeg",
    createdDate: "July 10, 2015",
  },
  authModalData: {
    showAuthModal: false,
  },
  // userData: null,
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
    updateAuthModalData: (state, action) => {
      state.authModalData = action.payload;
    },
  },
});

export const {
  updateSubmitModalData,
  updateLoginStatus,
  updateUserData,
  updateAuthModalData,
} = globalSlice.actions;

export default globalSlice.reducer;
