import { configureStore } from "@reduxjs/toolkit";
import dailySlice, { IDailyInitialState } from "./dailySlice";
import globalSlice, { IGlobalInitialState } from "./globalSlice";
import cyberConnectSlice, {
  ICyberConnectInitialState,
} from "./cyberConnectSlice";
import gumSlice, { IGumInitialState } from "./gumSlice";

export interface IRootState {
  global: IGlobalInitialState;
  daily: IDailyInitialState;
  cyberConnect: ICyberConnectInitialState;
  gum: IGumInitialState;
}

export default configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  reducer: {
    global: globalSlice,
    daily: dailySlice,
    cyberConnect: cyberConnectSlice,
    gum: gumSlice,
  },
});
