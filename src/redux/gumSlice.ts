import { createSlice } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { SDK } from "@gumhq/sdk";

export interface IGumInitialState {
  user: PublicKey | null;
  sdkInfo: SDK | null;
}

const initialState: IGumInitialState = {
  user: null,
  sdkInfo: null,
};

export const gumSlice = createSlice({
  name: "gumSlice",
  initialState,
  reducers: {
    updateUserPubKey: (state, action) => {
      state.user = action.payload;
    },
    updateSDK: (state, action) => {
      state.sdkInfo = action.payload;
    },
  },
});

export const { updateUserPubKey, updateSDK } = gumSlice.actions;

export default gumSlice.reducer;
