import {
  reduceAccessibleForm as reduce,
  DEFAULT_ACCESSIBLE_FORM as init,
  Bounds,
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
  test("Zoom changes the annotation sizes appropriately", () => {
    const annotation = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload: annotation,
    });
    const withAnnotation = reduce(created, { type: "CHANGE_ZOOM", payload: 2 });
    expect(withAnnotation.annotations["1"].height).toEqual(20);
    expect(withAnnotation.annotations["1"].width).toEqual(20);
    expect(withAnnotation.annotations["1"].top).toEqual(10);
    expect(withAnnotation.annotations["1"].left).toEqual(10);
  });
  test("Zoom changes the token sizes appropriately", () => {
    const res = reduce(init, { type: "CHANGE_ZOOM", payload: 2 });
    expect(res.zoom).toEqual(2);
    expect(res.tokens[0][0].height).toBe(init.tokens[0][0].height * 2);
    expect(res.tokens[0][0].width).toBe(init.tokens[0][0].width * 2);
    expect(res.tokens[0][0].top).toBe(init.tokens[0][0].top * 2);
    expect(res.tokens[0][0].left).toBe(init.tokens[0][0].left * 2);
  });
  test("We can change the active tool", () => {
    const res = reduce(init, { type: "CHANGE_TOOL", payload: "SELECT" });
    expect(res.tool).toEqual("SELECT");
  });
  test("We can change the current page", () => {
    const res = reduce(init, { type: "CHANGE_PAGE", payload: 2 });
    expect(res.page).toEqual(2);
  });
  test("We can add an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const res = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(res.annotations["1"]).toEqual(payload);
  });
  test("Adding an annotation does the right thing with undo/redo", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const res = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(res.currentVersion).toBe(0);
    expect(Array.isArray(res.versions[0].redo)).toBe(true);
    expect(res.canRedo).toBe(false);
    expect(res.canUndo).toBe(true);
  });
  test("We can undo/redo a create", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(Object.keys(created.annotations)).toHaveLength(1);
    const undo = reduce(created, { type: "UNDO" });
    expect(Object.keys(undo.annotations)).toHaveLength(0);
    const redo = reduce(undo, { type: "REDO" });
    expect(Object.keys(redo.annotations)).toHaveLength(1);
  });
  test("canUndo and canRedo work properly", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const undo = reduce(created, { type: "UNDO" });
    expect(undo.canUndo).toBeFalsy();
    expect(undo.canRedo).toBeTruthy();
    const redo = reduce(undo, { type: "REDO" });
    expect(redo.canUndo).toBeTruthy();
    expect(redo.canRedo).toBeFalsy();
  });
  test("We can delete an annotation after we create it", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      height: 10,
      width: 10,
      top: 5,
      left: 5,
      border: "pink",
    } as const;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    const deleted = reduce(created, {
      type: "DELETE_ANNOTATION",
      payload: ["1"],
    });
    expect(deleted.annotations["1"]).toBe(undefined);
  });
  test("We can move an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    } as const;
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
    expect(moved.annotations["1"].top).toBe(5);
    expect(moved.annotations["1"].left).toBe(5);
  });
  test("We can resize an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    } as const;
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
        x: 10,
        y: 20,
      },
    });
    expect(moved.annotations["1"].width).toBe(50);
    expect(moved.annotations["1"].height).toBe(40);
    expect(moved.annotations["1"].top).toBe(20);
    expect(moved.annotations["1"].left).toBe(10);
  });
  test("We can select an annotation", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    } as const;
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
      type: "TEXTBOX",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    } as const;
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
      type: "TEXTBOX",
      top: 10,
      left: 10,
      height: 10,
      width: 10,
      border: "pink",
    } as const;
    const payload2 = {
      id: "2",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 20,
      left: 20,
      height: 5,
      width: 5,
      border: "pink",
    } as const;
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
  test("We can hydrate the store", () => {
    const payload = {
      annotations: {},
      selectedAnnotations: {},
      page: 2,
      tool: "CREATE",
      step: 1,
      zoom: 3,
      canRedo: false,
      canUndo: false,
      versions: {},
      currentVersion: -1,
      tokens: [] as Bounds[][],
    } as const;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res).toEqual(payload);
  });
  test("We set annotation type", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 20,
      left: 20,
      height: 5,
      width: 5,
      border: "pink",
    } as const;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload: payload,
    });
    const changed = reduce(created, {
      type: "SET_ANNOTATION_TYPE",
      payload: {
        ids: ["1"],
        type: "CHECKBOX",
      },
    });
    expect(changed.annotations["1"].type).toBe("CHECKBOX");
  });
});
