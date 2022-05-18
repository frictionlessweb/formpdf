import {
  reduceAccessibleForm as reduce,
  DEFAULT_ACCESSIBLE_FORM as init,
  Bounds,
  ANNOTATION_TYPE,
  AccessibleForm,
  ANNOTATION_BORDER,
} from "./StoreProvider";
import exampleState from "./exampleState.json";

describe("Our form reducer", () => {
  test("Returns the default initial state if it didn't previously exist", () => {
    const res = reduce(undefined, {
      type: "CHANGE_CURRENT_STEP",
      payload: "SECTION_LAYER",
    });
    expect(res).toEqual(init);
  });
  test("Works with changing the current step", () => {
    const res = reduce(init, {
      type: "CHANGE_CURRENT_STEP",
      payload: "SECTION_LAYER",
    });
    expect(res.step).toEqual("SECTION_LAYER");
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
    } as const;
    const res = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(res.annotations["1"]).toEqual(payload);
  });
  test("We can create an annotation from a token", () => {
    const payload = {
      tokens: [{ height: 10, width: 10, top: 3, left: 3 }],
      ui: {
        type: "TEXTBOX" as ANNOTATION_TYPE,
        id: "1",
        backgroundColor: "red",
        border: "2px solid blue",
        corrected: false,
        page: 1,
      },
    };
    const res = reduce(init, {
      type: "CREATE_ANNOTATION_FROM_TOKENS",
      payload,
    });
    expect(res.annotations["1"].height).toBe(13);
    expect(res.annotations["1"].width).toBe(13);
    expect(res.annotations["1"].top).toBe(0);
    expect(res.annotations["1"].left).toBe(0);
  });
  test("Creating annotations from 0 tokens does nothing", () => {
    const payload = {
      tokens: [],
      ui: {
        type: "TEXTBOX" as ANNOTATION_TYPE,
        id: "1",
        backgroundColor: "red",
        border: "2px solid blue",
        corrected: false,
        page: 1,
      },
    };
    const res = reduce(init, {
      type: "CREATE_ANNOTATION_FROM_TOKENS",
      payload,
    });
    expect(res).toEqual(init);
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
      page: 1,
      corrected: false,
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
      corrected: false,
      page: 1,
    } as const;
    const length = Object.keys(init.annotations).length;
    const created = reduce(init, {
      type: "CREATE_ANNOTATION",
      payload,
    });
    expect(Object.keys(created.annotations)).toHaveLength(length + 1);
    const undo = reduce(created, { type: "UNDO" });
    expect(Object.keys(undo.annotations)).toHaveLength(length);
    const redo = reduce(undo, { type: "REDO" });
    expect(Object.keys(redo.annotations)).toHaveLength(length + 1);
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
    expect(moved.annotations["1"].corrected).toBe(true);
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
      corrected: false,
      page: 1,
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
      showLoadingScreen: false,
      page: 2,
      tool: "CREATE",
      step: "FIELD_LAYER",
      zoom: 3,
      canRedo: false,
      canUndo: false,
      versions: {},
      currentVersion: -1,
      tokens: [] as Bounds[][],
      labelRelations: {},
      groupRelations: {},
      haveScaled: true,
      width: 1000,
      height: 550,
      showResizeModal: false,
      sliderPosition: {
        y: 1000,
        height: 320,
      },
    } as const;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res).toEqual(payload);
  });
  test("When the device pixel ratio changes, the tokens scale", () => {
    const payload = {
      annotations: {},
      selectedAnnotations: {},
      page: 2,
      tool: "CREATE",
      step: "FIELD_LAYER",
      zoom: 3,
      canRedo: false,
      canUndo: false,
      versions: {},
      currentVersion: -1,
      tokens: [[{ top: 0, left: 0, height: 25, width: 25 }]] as Bounds[][],
      labelRelations: {},
      groupRelations: {},
      haveScaled: false,
      width: 1000,
      height: 550,
      showResizeModal: false,
      showLoadingScreen: false,
      sliderPosition: {
        y: 1000,
        height: 320,
      },
    } as const;
    window.devicePixelRatio = 2;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res.tokens[0][0].height).toEqual(50);
    expect(res.tokens[0][0].width).toEqual(50);
    window.devicePixelRatio = 1;
  });
  test("Scaling the pixel ratio sets haveScaled to true", () => {
    const payload = {
      annotations: {},
      selectedAnnotations: {},
      page: 2,
      tool: "CREATE",
      step: "FIELD_LAYER",
      zoom: 3,
      canRedo: false,
      canUndo: false,
      versions: {},
      currentVersion: -1,
      tokens: [[{ top: 0, left: 0, height: 25, width: 25 }]] as Bounds[][],
      labelRelations: {},
      groupRelations: {},
      haveScaled: false,
      width: 1000,
      height: 550,
      showResizeModal: false,
      showLoadingScreen: false,
      sliderPosition: {
        y: 1000,
        height: 320,
      },
    } as const;
    window.devicePixelRatio = 2;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res.haveScaled).toBe(true);
    window.devicePixelRatio = 1;
  });

  test("If we have already scaled, we don't scale again", () => {
    const payload = {
      annotations: {},
      selectedAnnotations: {},
      page: 2,
      tool: "CREATE",
      step: "FIELD_LAYER",
      zoom: 3,
      canRedo: false,
      canUndo: false,
      versions: {},
      currentVersion: -1,
      tokens: [[{ top: 0, left: 0, height: 25, width: 25 }]] as Bounds[][],
      labelRelations: {},
      groupRelations: {},
      haveScaled: true,
      width: 1000,
      height: 550,
      showResizeModal: false,
      showLoadingScreen: false,
      sliderPosition: {
        y: 1000,
        height: 320,
      },
    } as const;
    window.devicePixelRatio = 2;
    const res = reduce(init, { type: "HYDRATE_STORE", payload });
    expect(res.tokens[0][0].height).toEqual(25);
    expect(res.tokens[0][0].width).toEqual(25);
    window.devicePixelRatio = 1;
  });
  test("We can set the annotation type", () => {
    const payload = {
      id: "1",
      backgroundColor: "lightpink",
      type: "TEXTBOX",
      top: 20,
      left: 20,
      height: 5,
      width: 5,
      border: "pink",
      corrected: false,
      page: 1,
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
    expect(changed.annotations["1"].corrected).toBe(true);
  });
  test("We can set step of the process and when we do it tool automatically gets changed to select", () => {
    const changedTool = reduce(init, {
      type: "CHANGE_TOOL",
      payload: "CREATE",
    });
    const changedStep = reduce(changedTool, {
      type: "SET_STEP",
      payload: "SECTION_LAYER",
    });

    expect(changedStep.step).toBe("SECTION_LAYER");
    expect(changedStep.tool).toBe("SELECT");
  });
  test("We can create label relation", () => {
    const to = {
      ui: {
        id: "1",
        backgroundColor: "lightpink",
        type: "TEXTBOX" as ANNOTATION_TYPE,
        border: "3px solid grey",
        corrected: false,
        page: 1,
      },
      tokens: [
        {
          height: 10,
          width: 10,
          top: 5,
          left: 5,
          border: "pink",
        },
      ],
    };
    const relationCreated = reduce(init, {
      type: "CREATE_LABEL_RELATION",
      payload: {
        to,
        from: "2",
      },
    });
    expect(relationCreated.annotations["1"].id).toEqual("1");
    expect(relationCreated.annotations["1"].corrected).toEqual(true);
    expect(relationCreated.labelRelations["1"]).toEqual("2");
    expect(relationCreated.tool).toEqual("SELECT");
    expect(relationCreated.selectedAnnotations).toEqual({});
  });
  test("One label relation replaces another", () => {
    const to = {
      ui: {
        id: "1",
        backgroundColor: "lightpink",
        type: "TEXTBOX" as ANNOTATION_TYPE,
        border: "3px solid grey",
        corrected: false,
        page: 1,
      },
      tokens: [
        {
          height: 10,
          width: 10,
          top: 5,
          left: 5,
          border: "pink",
        },
      ],
    };
    const relationCreated = reduce(init, {
      type: "CREATE_LABEL_RELATION",
      payload: {
        to,
        from: "2",
      },
    });
    const relationCreatedAgain = reduce(relationCreated, {
      type: "CREATE_LABEL_RELATION",
      payload: {
        to: {
          ...to,
          ui: {
            ...to.ui,
            id: "3",
          },
        },
        from: "2",
      },
    });
    expect(Object.keys(relationCreatedAgain.labelRelations).length).toEqual(1);
    expect(relationCreated.annotations["1"].id).toEqual("1");
    expect(relationCreated.annotations["1"].corrected).toEqual(true);
    expect(relationCreated.labelRelations["1"]).toEqual("2");
    expect(relationCreated.tool).toEqual("SELECT");
    expect(relationCreated.selectedAnnotations).toEqual({});
  });
  test("If we try to create a label relation with no tokens, nothing happens", () => {
    const to = {
      ui: {
        id: "1",
        backgroundColor: "lightpink",
        type: "TEXTBOX" as ANNOTATION_TYPE,
        border: "3px solid grey",
        corrected: false,
        page: 1,
      },
      tokens: [],
    };
    const relationCreated = reduce(init, {
      type: "CREATE_LABEL_RELATION",
      payload: {
        to,
        from: "2",
      },
    });
    expect(relationCreated).toEqual(init);
  });
  test("We can create group relation", () => {
    const from = {
      ui: {
        id: "3",
        backgroundColor: "lightpink",
        type: "GROUP" as const,
        border: "3px solid grey",
      },
      tokens: [
        {
          height: 10,
          width: 10,
          top: 5,
          left: 5,
          border: "pink",
        },
      ],
    };
    const relationWithArrayCreated = reduce(init, {
      type: "CREATE_GROUP_RELATION",
      payload: {
        from: from,
        to: ["2", "1"],
      },
    });
    expect(relationWithArrayCreated.annotations["3"]).toBeDefined();
    expect(relationWithArrayCreated.groupRelations["3"]).toEqual(["2", "1"]);
    expect(relationWithArrayCreated.tool).toEqual("CREATE");
  });
  test("We can delete a group relation", () => {
    const groupLabelId = "98d3098e-10db-4fe8-bba7-2d04b07e20aa";
    const groupId = exampleState.labelRelations[groupLabelId];
    const res = reduce(exampleState as AccessibleForm, {
      type: "DELETE_GROUP",
      payload: "98d3098e-10db-4fe8-bba7-2d04b07e20aa",
    });
    expect(res.labelRelations).toEqual({});
    expect(res.groupRelations).toEqual({});
    expect(res.annotations[groupLabelId]).toBeUndefined();
    expect(res.annotations[groupId]).toBeUndefined();
    expect(res.selectedAnnotations).toEqual({});
  });
  test("We can move the section slider around on the first step", () => {
    const res = reduce(init, {
      type: "MOVE_SECTION_SLIDER",
      payload: { y: 32, height: 64 },
    });
    expect(res.sliderPosition.y).toEqual(32);
    expect(res.sliderPosition.height).toEqual(64);
    expect(res.showResizeModal).toEqual(false);
  });
  test("Moving the slider in later stages brings up the modal", () => {
    const res = reduce(
      { ...init, step: "LABEL_LAYER" },
      {
        type: "MOVE_SECTION_SLIDER",
        payload: { y: 32, height: 64 },
      }
    );
    expect(res.sliderPosition.y).toEqual(32);
    expect(res.sliderPosition.height).toEqual(64);
    expect(res.showResizeModal).toBe(true);
  });
  test("We can jump back to the section layer", () => {
    const res = reduce(
      { ...init, showResizeModal: true, step: "LABEL_LAYER" },
      {
        type: "JUMP_BACK_TO_SECTION_LAYER",
      }
    );
    expect(res.step).toEqual("SECTION_LAYER");
    expect(res.showResizeModal).toBe(false);
  });
  test("We can set the loading screen to true", () => {
    const res = reduce(init, { type: "SHOW_LOADING_SCREEN" });
    expect(res.showLoadingScreen).toBe(true);
  });
  test("When we change the step and annotations, we set loading to false", () => {
    const res = reduce(
      { ...init, showLoadingScreen: true },
      {
        type: "INCREMENT_STEP_AND_ANNOTATIONS",
        payload: {
          annotations: [],
          labelRelations: {},
          groupRelations: {},
        },
      }
    );
    expect(res.showLoadingScreen).toBe(false);
  });
  test("When we change the step and annotations, the step changes as well", () => {
    const res = reduce(
      { ...init, showLoadingScreen: true, step: "LABEL_LAYER" },
      {
        type: "INCREMENT_STEP_AND_ANNOTATIONS",
        payload: {
          annotations: [],
          labelRelations: {},
          groupRelations: {},
        },
      }
    );
    expect(res.step).toBe("GROUP_LAYER");
  });
  test("We set the annotations appropriately when we get new ones from the API", () => {
    const res = reduce(
      { ...init, showLoadingScreen: true },
      {
        type: "INCREMENT_STEP_AND_ANNOTATIONS",
        payload: {
          annotations: [
            [
              {
                type: "TEXTBOX",
                height: 200,
                id: "1234",
                left: 10,
                top: 20,
                width: 234,
              },
            ],
          ],
          labelRelations: {},
          groupRelations: {},
        },
      }
    );
    expect(Object.keys(res.annotations)).toHaveLength(1);
    expect(res.annotations["1234"].width).toEqual(234);
    expect(res.annotations["1234"].border).toEqual(ANNOTATION_BORDER);
  });
  test("Changing the step and the annotations also changes the tool", () => {
    const res = reduce(
      { ...init, tool: "CREATE" },
      {
        type: "INCREMENT_STEP_AND_ANNOTATIONS",
        payload: {
          annotations: [
            [
              {
                type: "TEXTBOX",
                height: 200,
                id: "1234",
                left: 10,
                top: 20,
                width: 234,
              },
            ],
          ],
          labelRelations: {},
          groupRelations: {},
        },
      }
    );
    expect(res.tool).toEqual("SELECT");
  });
  test("Changing the step and annotation also changes the relations", () => {
    const labelRelations = { a: "b" };
    const groupRelations = { c: ["d", "e", "f"] };
    const res = reduce(
      { ...init, tool: "CREATE" },
      {
        type: "INCREMENT_STEP_AND_ANNOTATIONS",
        payload: {
          annotations: [
            [
              {
                type: "TEXTBOX",
                height: 200,
                id: "1234",
                left: 10,
                top: 20,
                width: 234,
              },
            ],
          ],
          labelRelations,
          groupRelations,
        },
      }
    );
    expect(res.tool).toEqual("SELECT");
    expect(res.labelRelations).toEqual(labelRelations);
    expect(res.groupRelations).toEqual(groupRelations);
  });
  test("We can goto the next step", () => {
    const res = reduce(init, { type: "GOTO_NEXT_STEP" });
    expect(res.step).toEqual("FIELD_LAYER");
  });
  test("We can goto a previous step", () => {
    const next = reduce(init, { type: "GOTO_NEXT_STEP" });
    const prev = reduce(next, {
      type: "GOTO_PREVIOUS_STEP",
      payload: "SECTION_LAYER",
    });
    expect(prev.step).toEqual("SECTION_LAYER");
  });
  test("We can't skip ahead with goto previous step", () => {
    const next = reduce(init, { type: "GOTO_NEXT_STEP" });
    const prev = reduce(next, {
      type: "GOTO_PREVIOUS_STEP",
      payload: "GROUP_LAYER",
    });
    expect(prev.step).toEqual("FIELD_LAYER");
  });
});
