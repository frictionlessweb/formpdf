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
  test("We can change the current page", () => {
    const res = reduce(init, { type: "CHANGE_PAGE", payload: 2 });
    expect(res.page).toEqual(2);
  });
  test("We can add an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    };
    const res = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(res.annotations["1"]).toEqual(payload);
  });
  test("We can delete an annotation after we create it", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    };
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const deleted = reduce(created, {
      type: "DELETE_ANNOTATION",
      payload: "1",
    });
    expect(deleted.annotations["1"]).toBe(undefined);
  });
  test("We can move an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    };
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const moved = reduce(created, {
      type: "MOVE_ANNOTATION",
      payload: {
        id: "1",
        x: 5,
        y: 5,
      },
    });
    expect(moved.annotations["1"].top).toBe(15);
    expect(moved.annotations["1"].left).toBe(15);
  });
  test("We can resize an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    };
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const moved = reduce(created, {
      type: "RESIZE_ANNOTATION",
      payload: {
        id: "1",
        width: 50,
        height: 40,
      },
    });
    expect(moved.annotations["1"].width).toBe(50);
    expect(moved.annotations["1"].height).toBe(40);
  });
  test("We can select an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    };
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const selected = reduce(created, {
      type: "SELECT_ANNOTATION",
      payload: "1",
    });
    expect(selected.selectedAnnotations).toEqual({ "1": true });
  });
  test("We can deselect an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    };
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const selected = reduce(created, {
      type: "SELECT_ANNOTATION",
      payload: "1",
    });
    const deSelected = reduce(selected, {
      type: "DESELECT_ANNOTATION",
      payload: "1",
    });
    expect(deSelected.selectedAnnotations).toEqual({});
  });
  test("We can deselect all annotations at once", () => {
    const payload1 = {
      id: "1",
      backgroundColor: "lightpink",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    };
    const payload2 = {
      id: "2",
      backgroundColor: "lightpink",
      top: 20,
      left: 20,
      height: 5,
      width: 5,
      border: "pink",
    };
    const createdFirst = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload: payload1,
    });
    const createdSecond = reduce(createdFirst, {
      type: "CREATE_ANNOTATION",
      payload: payload2,
    });
    const selectedFirst = reduce(createdSecond, {
      type: "SELECT_ANNOTATION",
      payload: "1",
    });
    const selectedSecond = reduce(selectedFirst, {
      type: "SELECT_ANNOTATION",
      payload: "1",
    });
    const deSelectedAll = reduce(selectedSecond, {
      type: "DESELECT_ALL_ANNOTATION",
    });
    expect(deSelectedAll.selectedAnnotations).toEqual({});
  });
  test("We can hypdrate the store", () => {
    const payload = {
      annotations: {},
      selectedAnnotations: {},
      page: 2,
      tool: "CREATE",
      step: 1,
      zoom: 3,
    } as const;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res).toEqual(payload);
  });
});
