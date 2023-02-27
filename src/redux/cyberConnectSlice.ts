import { createSlice } from "@reduxjs/toolkit";
import { Web3Provider } from "@ethersproject/providers";

export interface ICyberConnectInitialState {
  address: string | null;
  accessToken: string | null;
  provider: Web3Provider | null;
}

const initialState: ICyberConnectInitialState = {
  address: null,
  accessToken: null,
  provider: null,
};

const cyberConnectSlice = createSlice({
  name: "cyberConnect",
  initialState,
  reducers: {
    setAddress(state, action) {
      state.address = action.payload;
    },
    setProvider(state, action) {
      state.provider = action.payload;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
  },
});

export const { setAddress, setProvider, setAccessToken } =
  cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
