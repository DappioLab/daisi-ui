import { configureStore } from "@reduxjs/toolkit";
import testSlice from "./testSlice";

export interface IRootState {
  test: any;
}

export default configureStore({
  reducer: {
    test: testSlice,
  },
});
