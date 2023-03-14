import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dailySlice from "./dailySlice";
import globalSlice from "./globalSlice";
import cyberConnectSlice from "./cyberConnectSlice";
import gumSlice, { IGumInitialState } from "./gumSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { getPersistConfig } from "redux-deep-persist";

// const persistConfig = {
//   key: "root",
//   version: 1,
//   storage,
//   blacklist: ["gum", "global.showFeedModal"],
// };

const rootReducer = combineReducers({
  global: globalSlice,
  daily: dailySlice,
  cyberConnect: cyberConnectSlice,
  gum: gumSlice,
});

const persistConfig = getPersistConfig({
  key: "root",
  storage,
  blacklist: ["gum", "global.showFeedModal"],
  rootReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// export interface IRootState {
//   global: IGlobalInitialState;
//   daily: IDailyInitialState;
//   cyberConnect: ICyberConnectInitialState;
//   gum: IGumInitialState;
// }

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  reducer: { persistedReducer },
});

export type IRootState = ReturnType<typeof store.getState>;
export type appDispatch = typeof store.dispatch;

// @ts-ignore
export const persistor = persistStore(store);
