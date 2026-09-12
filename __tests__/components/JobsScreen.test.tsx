import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import jobsReducer from "../../app/store/slices/jobsSlice";

jest.mock("@expo/vector-icons/FontAwesome", () => "FontAwesome");
jest.mock("@/components/Themed", () => {
  const { Text } = require("react-native");
  return { Text };
});
jest.mock("@/components/UI", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    Card: ({ children, style }: any) =>
      React.createElement(View, { style }, children),
    Header: ({ title, subtitle }: any) =>
      React.createElement(
        View,
        null,
        React.createElement(Text, null, title),
        subtitle ? React.createElement(Text, null, subtitle) : null
      ),
  };
});

jest.mock("../../app/store/thunks", () => {
  const fetchJobs = jest.fn(() => ({ type: "jobs/test/noop" }));
  (fetchJobs as any).pending = { type: "jobs/fetchJobs/pending" };
  (fetchJobs as any).fulfilled = { type: "jobs/fetchJobs/fulfilled" };
  (fetchJobs as any).rejected = { type: "jobs/fetchJobs/rejected" };
  return {
    fetchJobs,
    applyToJobAsync: jest.fn(() => ({ type: "jobs/test/noop" })),
  };
});

jest.mock("react-native-toast-message", () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

import JobsScreen from "../../app/(tabs)/jobs";

function renderJobs(preloaded?: { items?: any[]; loading?: boolean }) {
  const store = configureStore({
    reducer: { jobs: jobsReducer },
    preloadedState: {
      jobs: {
        items: preloaded?.items ?? [],
        loading: preloaded?.loading ?? false,
        error: null,
      },
    },
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <JobsScreen />
      </Provider>
    ),
  };
}

describe("JobsScreen", () => {
  it("shows empty state when there are no postings", async () => {
    const { getByText } = renderJobs({ items: [] });
    await waitFor(() => {
      expect(getByText("No job postings yet")).toBeTruthy();
    });
    expect(
      getByText(/Active members can post openings from a group/i)
    ).toBeTruthy();
  });

  it("renders job cards with apply action", async () => {
    const { getByText } = renderJobs({
      items: [
        {
          id: "j1",
          title: "Backend Engineer",
          company: "GradLink",
          location: "Remote",
          employmentType: "FULL_TIME",
          active: true,
          groupCode: "alumni",
          groupName: "Alumni",
          hasApplied: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    await waitFor(() => {
      expect(getByText("Backend Engineer")).toBeTruthy();
    });
    expect(getByText(/GradLink/)).toBeTruthy();
    expect(getByText("Apply")).toBeTruthy();
  });

  it("shows Applied when hasApplied is true", async () => {
    const { getByText } = renderJobs({
      items: [
        {
          id: "j2",
          title: "Designer",
          company: "Studio",
          employmentType: "INTERNSHIP",
          active: true,
          groupCode: "alumni",
          hasApplied: true,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    await waitFor(() => expect(getByText("Applied")).toBeTruthy());
  });
});
