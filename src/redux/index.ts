import { configureStore } from "@reduxjs/toolkit";
import dailySlice, { IDailyInitialState } from "./dailySlice";

export interface IRootState {
  daily: IDailyInitialState;
}

export default configureStore({
  reducer: {
    daily: dailySlice,
  },
});
