import discoverSlice from "./discoverSlice";
import globalSlice from "./globalSlice";
import cyberConnectSlice from "./cyberConnectSlice";
import gumSlice from "./gumSlice";
import storage from "redux-persist/lib/storage";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { getPersistConfig } from "redux-deep-persist";

const rootReducer = combineReducers({
  global: globalSlice,
  discover: discoverSlice,
  cyberConnect: cyberConnectSlice,
  gum: gumSlice,
});

const persistConfig = getPersistConfig({
  key: "root",
  storage,
  blacklist: [
    "gum",
    "global.showPostModal",
    "global.showAuthModal",
    "global.showSubmitModal",
    "global.eventNotificationQueue",
    "global.isLoading",
    "global.currentCheckingCommentParentId",
    "global.showCommentListModal",
    "discoverSlice.postList",
  ],
  rootReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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
