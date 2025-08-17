import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThreadAnswer } from "../types";

export interface TopicAnswersState {
  [key: string]: ThreadAnswer[];
}

const initialState: TopicAnswersState = {};

const topicAnswersSlice = createSlice({
  name: "topicAnswers",
  initialState,
  reducers: {
    setTopicAnswers: (
      state,
      action: PayloadAction<{ key: string; answers: ThreadAnswer[] }>
    ) => {
      state[action.payload.key] = action.payload.answers;
    },
    updateTopicAnswers: (
      state,
      action: PayloadAction<{ key: string; answers: ThreadAnswer[] }>
    ) => {
      state[action.payload.key] = action.payload.answers;
    },
    clearTopicAnswers: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setTopicAnswers, updateTopicAnswers, clearTopicAnswers } =
  topicAnswersSlice.actions;

export default topicAnswersSlice.reducer;
