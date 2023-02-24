import { createSlice } from "@reduxjs/toolkit";

export interface IDailyInitialState {
  currentId: string | null;
  feedList: any[];
  modalData: any;
}

const initialState: IDailyInitialState = {
  currentId: null,
  feedList: [],
  modalData: null,
};

export const dailySlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    updateCurrentId: (state, action) => {
      state.currentId = action.payload;
    },
    updateFeedList: (state, action) => {
      state.feedList = action.payload;
    },
    updateModalData: (state, action) => {
      state.modalData = action.payload;
    },
  },
});

export const { updateCurrentId, updateFeedList, updateModalData } =
  dailySlice.actions;

export default dailySlice.reducer;
