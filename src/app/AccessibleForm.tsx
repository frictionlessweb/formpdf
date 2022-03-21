import React from "react";
import produce from "immer";
import { createStore } from "redux";
import {
  Provider,
  useSelector as useSelectorRedux,
  useDispatch as useDispatchRedux,
  TypedUseSelectorHook,
} from "react-redux";
import { devToolsEnhancer } from "@redux-devtools/extension";

//     _                      _        _   _
//    / \   _ __  _ __   ___ | |_ __ _| |_(_) ___  _ __  ___
//   / _ \ | '_ \| '_ \ / _ \| __/ _` | __| |/ _ \| '_ \/ __|
//  / ___ \| | | | | | | (_) | || (_| | |_| | (_) | | | \__ \
// /_/   \_\_| |_|_| |_|\___/ \__\__,_|\__|_|\___/|_| |_|___/
// -----------------------------------------------------------------------
// An annotation represents a highlighted rectangle that we display on top
// of a PDF file.

type AnnotationId = string;

export interface Annotation {
  // What is the ID of the annotation?
  id: AnnotationId;
  // The background color of the annotation.
  backgroundColor: string;
  // How tall should this annotation be?
  height: number;
  // How wide should this annotation be?
  width: number;
  // How far from the top should this annotation be?
  top: number;
  // How far from the left should this annotation be?
  left: number;
}

export interface AnnotationUIState {
  // Do we have the ability to drag/drop this component?
  draggable: boolean;
  // Do we have the ability to resize this component?
  resizable: boolean;
}

//     _                         _ _     _      _____
//    / \   ___ ___ ___  ___ ___(_) |__ | | ___|  ___|__  _ __ _ __ ___
//   / _ \ / __/ __/ _ \/ __/ __| | '_ \| |/ _ \ |_ / _ \| '__| '_ ` _ \
//  / ___ \ (_| (_|  __/\__ \__ \ | |_) | |  __/  _| (_) | |  | | | | | |
// /_/   \_\___\___\___||___/___/_|_.__/|_|\___|_|  \___/|_|  |_| |_| |_|
// -----------------------------------------------------------------------
// An accessible form puts together all of the state described above into a
// coherent data structure that we manipulate throughout the application.

export type TOOL = "CREATE" | "RESIZE" | "MOVE";

interface AccessibleForm {
  // What step is the user on of their editing process?
  step: number;
  // How far has the user Zoomed in or out of the PDF?
  zoom: number;
  // What are all of the annotations we've kept track of so far?
  annotations: Record<AnnotationId, Annotation>;
  // Which tool is active right now?
  tool: TOOL;
}

export const DEFAULT_ACCESSIBLE_FORM: AccessibleForm = {
  step: 0,
  tool: "CREATE",
  zoom: 1,
  annotations: {},
};

// AccessibleFormAction describes every important possible action that a user
// could take while editing the PDF UI.
type AccessibleFormAction =
  | { type: "CHANGE_CURRENT_STEP"; payload: number }
  | { type: "CHANGE_ZOOM"; payload: number }
  | { type: "CHANGE_TOOL"; payload: TOOL };

// reduceAccessibleForm determines how to update the state after a UI action
// takes place. It is *intentionally* very big and relies on pattern matching
// the type we encounter above.
//
// This function is pure even though it appears to contain mutating logic thanks
// to the immer library. immer takes care of cloning the previous state for us
// so that we don't need to worry about using the spread operator everywhere;
// we can just mutate the draft state to look the way we'd like, and immer will
// handle making copies of everything.
export const reduceAccessibleForm = (
  previous: AccessibleForm | undefined,
  action: AccessibleFormAction
): AccessibleForm => {
  if (previous === undefined) return DEFAULT_ACCESSIBLE_FORM;
  return produce(previous, (draft) => {
    switch (action.type) {
      case "CHANGE_CURRENT_STEP": {
        draft.step = action.payload;
        return;
      }
      case "CHANGE_ZOOM": {
        draft.zoom = action.payload;
        return;
      }
      case "CHANGE_TOOL": {
        draft.tool = action.payload;
        return;
      }
      default: {
        // We should never encounter this case; if we do, it means that
        // we've dispatched an action at runtime with a shape that we haven't
        // described in the AccessibleFormAction, which should raise an error
        // at compile time.
        //
        // To help the compiler enforce this envariant, we specify that missingCase
        // has the "never" type, which will cause a compiler error if we add a type
        // to the AccessibleFormAction that we don't handle in the switch statements
        // above.
        const missingCase: never = action;
        throw new Error(
          `Our reducer is missing ${JSON.stringify(missingCase, null, 2)}`
        );
      }
    }
  });
};

//  ____                 _   ____          _
// |  _ \ ___  __ _  ___| |_|  _ \ ___  __| |_   ___  __
// | |_) / _ \/ _` |/ __| __| |_) / _ \/ _` | | | \ \/ /
// |  _ <  __/ (_| | (__| |_|  _ <  __/ (_| | |_| |>  <
// |_| \_\___|\__,_|\___|\__|_| \_\___|\__,_|\__,_/_/\_\

const store = createStore(reduceAccessibleForm, devToolsEnhancer());

const AccessibleFormProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { children } = props;
  return <Provider store={store}>{children}</Provider>;
};

// See https://react-redux.js.org/using-react-redux/usage-with-typescript#define-typed-hooks
export const useSelector: TypedUseSelectorHook<AccessibleForm> =
  useSelectorRedux;

export const useDispatch = () => useDispatchRedux<typeof store.dispatch>();

export default AccessibleFormProvider;
