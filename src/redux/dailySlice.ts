// import { IFeed } from "@/components/homePage/feed";
import { createSlice } from "@reduxjs/toolkit";

export interface IRssSourceData {
  sourceTitle: string;
  sourceDescription: string;
  sourceLink: string;
  sourceIcon: string;
}

export interface IRssSourceItem {
  sourceTitle: string;
  sourceDescription: string;
  sourceLink: string;
  sourceImage: string;
  created: string;
}

export interface IParsedRssData extends IRssSourceData {
  items: IRssSourceItem[];
}

export interface IDailyInitialState {
  currentId: string | null;
  // feedList: IFeed[];
  feedList: IParsedRssData[];
  modalData: any;
}

const initialState: IDailyInitialState = {
  currentId: null,
  feedList: [],
  modalData: null,
};

export const dailySlice = createSlice({
  name: "dailySlice",
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
