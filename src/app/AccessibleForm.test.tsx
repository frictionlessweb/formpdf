import {
  reduceAccessibleForm as reduce,
  DEFAULT_ACCESSIBLE_FORM as init,
} from "./AccessibleForm";

describe("Our form reducer", () => {
  test("Returns the default initial state if it didn't previously exist", () => {
    const res = reduce(undefined, { type: "CHANGE_CURRENT_STEP", payload: 2 });
    expect(res).toEqual(init);
  });
  test("Works with changing the current step", () => {
    const res = reduce(init, { type: "CHANGE_CURRENT_STEP", payload: 2 });
    expect(res.step).toEqual(2);
  });
  test("Works with changing the zoom level", () => {
    const res = reduce(init, { type: "CHANGE_ZOOM", payload: 0.2 });
    expect(res.zoom).toEqual(0.2);
  });
  test("We can change the active tool", () => {
    const res = reduce(init, { type: "CHANGE_TOOL", payload: "RESIZE" });
    expect(res.tool).toEqual("RESIZE");
  });
});
