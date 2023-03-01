import { configureStore } from "@reduxjs/toolkit";
import dailySlice, { IDailyInitialState } from "./dailySlice";
import globalSlice, { IGlobalInitialState } from "./globalSlice";
import cyberConnectSlice, {
  ICyberConnectInitialState,
} from "./cyberConnectSlice";

export interface IRootState {
  global: IGlobalInitialState;
  daily: IDailyInitialState;
  cyberConnect: ICyberConnectInitialState;
}

export default configureStore({
  reducer: {
    global: globalSlice,
    daily: dailySlice,
    cyberConnect: cyberConnectSlice,
  },
});
