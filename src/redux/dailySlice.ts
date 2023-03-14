// import { IFeed } from "@/components/homePage/feed";
import { EFeedType } from "@/components/homePage/horizontalFeed";
import { createSlice } from "@reduxjs/toolkit";

export interface IRssSourceData {
  id: string;
  sourceTitle: string;
  sourceDescription: string;
  sourceLink: string;
  sourceIcon: string;
}

export interface IRssSourceItem {
  id: string;
  itemTitle: string;
  itemDescription: string;
  itemLink: string;
  itemImage: string;
  created: string;
  likes: string[];
  forwards: string[];
  sourceIcon: string;
  linkCreated: string;
}

export interface IParsedRssData extends IRssSourceItem {
  source: IRssSourceData;
}

export interface IApiRssListResponse extends IRssSourceData {
  items: IRssSourceItem[];
}

export interface IDailyInitialState {
  feedList: IFeedList[];
  // modalData: any;
}

export interface IFeedList extends IRssSourceItem {
  type: EFeedType;
  sourceId: string;
}

const initialState: IDailyInitialState = {
  feedList: [],
  // modalData: null,
};

export const dailySlice = createSlice({
  name: "dailySlice",
  initialState,
  reducers: {
    updateFeedList: (state, action) => {
      state.feedList = action.payload;
    },
    // updateModalData: (state, action) => {
    //   state.modalData = action.payload;
    // },
  },
});

export const { updateFeedList } = dailySlice.actions;

export default dailySlice.reducer;
