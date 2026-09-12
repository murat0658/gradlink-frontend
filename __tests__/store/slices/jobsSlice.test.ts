import jobsReducer, {
  setJobs,
  addJob,
  updateJob,
  removeJob,
  markJobApplied,
  setLoading,
  setError,
} from "../../../app/store/slices/jobsSlice";
import { JobPosting } from "../../../app/store/types";

const createMockJob = (overrides: Partial<JobPosting> = {}): JobPosting => ({
  id: "1",
  title: "Software Engineer",
  description: "Build alumni tools",
  company: "Acme",
  location: "Remote",
  employmentType: "FULL_TIME",
  active: true,
  groupCode: "alumni",
  groupName: "Test U",
  applicationCount: 0,
  hasApplied: false,
  createdAt: "2026-09-12T10:00:00Z",
  ...overrides,
});

describe("jobsSlice", () => {
  const initialState = {
    items: [] as JobPosting[],
    loading: false,
    error: null as string | null,
  };

  it("returns the initial state", () => {
    expect(jobsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("setJobs replaces items and clears error", () => {
    const jobs = [createMockJob({ id: "1" }), createMockJob({ id: "2" })];
    const state = jobsReducer(
      { ...initialState, loading: true, error: "boom" },
      setJobs(jobs)
    );
    expect(state.items).toEqual(jobs);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("addJob prepends a posting", () => {
    const existing = createMockJob({ id: "old" });
    const created = createMockJob({ id: "new", title: "Intern" });
    const state = jobsReducer({ ...initialState, items: [existing] }, addJob(created));
    expect(state.items.map((j) => j.id)).toEqual(["new", "old"]);
  });

  it("updateJob updates a matching posting", () => {
    const state = jobsReducer(
      { ...initialState, items: [createMockJob({ id: "1", title: "Old" })] },
      updateJob(createMockJob({ id: "1", title: "New" }))
    );
    expect(state.items[0].title).toBe("New");
  });

  it("removeJob removes by id", () => {
    const state = jobsReducer(
      {
        ...initialState,
        items: [createMockJob({ id: "1" }), createMockJob({ id: "2" })],
      },
      removeJob("1")
    );
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("2");
  });

  it("markJobApplied sets hasApplied and bumps count", () => {
    const state = jobsReducer(
      {
        ...initialState,
        items: [createMockJob({ id: "1", hasApplied: false, applicationCount: 2 })],
      },
      markJobApplied("1")
    );
    expect(state.items[0].hasApplied).toBe(true);
    expect(state.items[0].applicationCount).toBe(3);
  });

  it("setLoading and setError update flags", () => {
    expect(jobsReducer(initialState, setLoading(true)).loading).toBe(true);
    const withError = jobsReducer(
      { ...initialState, loading: true },
      setError("failed")
    );
    expect(withError.error).toBe("failed");
    expect(withError.loading).toBe(false);
  });
});
