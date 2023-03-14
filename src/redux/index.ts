import { configureStore, combineReducers } from "@reduxjs/toolkit";
import dailySlice, { IDailyInitialState } from "./dailySlice";
import globalSlice, { IGlobalInitialState } from "./globalSlice";
import cyberConnectSlice, {
  ICyberConnectInitialState,
} from "./cyberConnectSlice";
import gumSlice, { IGumInitialState } from "./gumSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import {
  createFilter,
  createBlacklistFilter,
} from "redux-persist-transform-filter";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["gum"],
};

const rootReducer = combineReducers({
  global: globalSlice,
  daily: dailySlice,
  cyberConnect: cyberConnectSlice,
  gum: gumSlice,
});

const persistingReducers = createFilter(`gum`);

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
export const persistor = persistStore(store, { blacklist: ["global"] });
