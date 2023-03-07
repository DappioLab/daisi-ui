import { createSlice } from "@reduxjs/toolkit";
import { Web3Provider } from "@ethersproject/providers";
import { IPFSHTTPClient } from "ipfs-http-client";
import CyberConnect from "@cyberlab/cyberconnect-v2";

export interface IProfile {
  profileID: number;
  handle: string;
  avatar: string;
  metadata: string;
}

export interface ICyberConnectInitialState {
  address: string | null;
  accessToken: string | null;
  provider: Web3Provider | null;
  primaryProfile: IProfile | null;
  cyberConnectClient: CyberConnect | null;
  ipfsClient: IPFSHTTPClient | null;
}

const initialState: ICyberConnectInitialState = {
  address: null,
  accessToken: null,
  provider: null,
  primaryProfile: null,
  cyberConnectClient: null,
  ipfsClient: null,
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
    setPrimaryProfile(state, action) {
      state.primaryProfile = action.payload;
    },
    setCyberConnectClient(state, action) {
      state.cyberConnectClient = action.payload;
    },
    setIpfsClient(state, action) {
      state.ipfsClient = action.payload;
    },
  },
});

export const {
  setAddress,
  setProvider,
  setAccessToken,
  setPrimaryProfile,
  setCyberConnectClient,
  setIpfsClient,
} = cyberConnectSlice.actions;
export default cyberConnectSlice.reducer;
