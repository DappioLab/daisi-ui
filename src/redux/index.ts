import { configureStore } from "@reduxjs/toolkit";
import dailySlice, { IDailyInitialState } from "./dailySlice";
import cyberConnectSlice, {
  ICyberConnectInitialState,
} from "./cyberConnectSlice";

export interface IRootState {
  daily: IDailyInitialState;
  cyberConnect: ICyberConnectInitialState;
}

export default configureStore({
  reducer: {
    daily: dailySlice,
    cyberConnect: cyberConnectSlice,
  },
});
