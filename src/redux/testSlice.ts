import { createSlice } from "@reduxjs/toolkit";

const initialState: any = {
  greet: "What's up!",
  name: "Benson",
};

export const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    updateGreet: (state, action) => {
      state.greet = action.payload;
    },
  },
});

export const { updateGreet } = testSlice.actions;

export default testSlice.reducer;
