import React from "react";
import produce, {
  enablePatches,
  applyPatches,
  produceWithPatches,
  Patch,
} from "immer";
import { createStore } from "redux";
import {
  Provider,
  useSelector as useSelectorRedux,
  useDispatch as useDispatchRedux,
  TypedUseSelectorHook,
} from "react-redux";
import { devToolsEnhancer } from "@redux-devtools/extension";
import TOKENS from "./tokens.json";
import PREDICTIONS from "./predictions.json";
import { boxContaining } from "./utils";

// This is required to enable immer patches.
enablePatches();

//     _                      _        _   _
//    / \   _ __  _ __   ___ | |_ __ _| |_(_) ___  _ __  ___
//   / _ \ | '_ \| '_ \ / _ \| __/ _` | __| |/ _ \| '_ \/ __|
//  / ___ \| | | | | | | (_) | || (_| | |_| | (_) | | | \__ \
// /_/   \_\_| |_|_| |_|\___/ \__\__,_|\__|_|\___/|_| |_|___/
// -----------------------------------------------------------------------
// An annotation represents a highlighted rectangle that we display on top
// of a PDF file.

export type AnnotationId = string;

export interface Bounds {
  // How far from the top of the canvas should this annotation be?
  top: number;
  // How far from the left of the canvas should this annotation be?
  left: number;
  // How wide is this annotation?
  width: number;
  // How tall is this annotation?
  height: number;
}

// What are the different types of annotation fields?
export type ANNOTATION_TYPE = "TEXTBOX" | "RADIOBOX" | "CHECKBOX" | "LABEL";

export type AnnotationUIState = {
  // What is the ID of the annotation -- how do we uniquely identify it?
  id: AnnotationId;
  // What is the color of the annotation?
  backgroundColor: string;
  // What is the border of the annotation?
  border: string;
  // What is the the type of the annotation?
  type: ANNOTATION_TYPE;
};

export type Annotation = Bounds & AnnotationUIState;

//     _                         _ _     _      _____
//    / \   ___ ___ ___  ___ ___(_) |__ | | ___|  ___|__  _ __ _ __ ___
//   / _ \ / __/ __/ _ \/ __/ __| | '_ \| |/ _ \ |_ / _ \| '__| '_ ` _ \
//  / ___ \ (_| (_|  __/\__ \__ \ | |_) | |  __/  _| (_) | |  | | | | | |
// /_/   \_\___\___\___||___/___/_|_.__/|_|\___|_|  \___/|_|  |_| |_| |_|
// -----------------------------------------------------------------------
// An accessible form puts together all of the state described above into a
// coherent data structure that we manipulate throughout the application.

export type TOOL = "CREATE" | "SELECT";

// What are the changes that we care about?
interface Changes {
  // Redo changes
  redo: Array<Patch>;
  // Undo changes
  undo: Array<Patch>;
}

type VersionId = number;

export interface AccessibleForm {
  // What step is the user on of their editing process?
  step: number;
  // How far has the user Zoomed in or out of the PDF?
  zoom: number;
  // Which page of the PDF are we on? WARNING: This is indexed from *1*, not
  // from zero!
  page: number;
  // What are all of the annotations we've kept track of so far?
  annotations: Record<AnnotationId, Annotation>;
  // Which tool is active right now?
  tool: TOOL;
  // Which annotations are selected currently.
  selectedAnnotations: Record<AnnotationId, boolean>;
  // What are the patches that we need to keep track of?
  versions: Record<VersionId, Changes>;
  // What is the current version that we are working on?
  currentVersion: number;
  // Can undo be performed.
  canUndo: boolean;
  // Can redo be performed.
  canRedo: boolean;
  // What are the tokens associated with the document?
  tokens: Array<Bounds[]>;
  // How are annotations related to each other? Ex: field and label, groups.
  relations: Record<AnnotationId, AnnotationId | Array<AnnotationId>>;
}

// FIXME: Here we need to implement page logic.
// This function grabs the prediction from prediction.json, creates
// annotation out of them and its output is used to populate annotations
// in DEFAULT_ACCESSIBLE_FORM.
const getPredictedAnnotations = () => {
  const predictedAnnotations: Record<AnnotationId, Annotation> = {};
  PREDICTIONS.forEach((prediction) => {
    const { top, left, width, height } = prediction;
    const id: AnnotationId = window.crypto.randomUUID();
    predictedAnnotations[id] = {
      id,
      backgroundColor: "rgb(255, 182, 193, 0.3)",
      border: "3px solid red",
      type: "TEXTBOX",
      top,
      left,
      width,
      height,
    };
  });
  return predictedAnnotations;
};

export const DEFAULT_ACCESSIBLE_FORM: AccessibleForm = {
  step: 0,
  tool: "CREATE",
  zoom: 1,
  page: 1,
  annotations: getPredictedAnnotations(),
  selectedAnnotations: {},
  canRedo: false,
  canUndo: false,
  currentVersion: -1,
  versions: {},
  tokens: TOKENS,
  relations: {},
};

// AccessibleFormAction describes every important possible action that a user
// could take while editing the PDF UI.
type AccessibleFormAction =
  | { type: "CHANGE_CURRENT_STEP"; payload: number }
  | { type: "CHANGE_ZOOM"; payload: number }
  | { type: "CHANGE_PAGE"; payload: number }
  | { type: "CHANGE_TOOL"; payload: TOOL }
  | { type: "CREATE_ANNOTATION"; payload: Annotation }
  | {
      type: "CREATE_ANNOTATION_FROM_TOKENS";
      payload: { ui: AnnotationUIState; tokens: Bounds[] };
    }
  | { type: "DELETE_ANNOTATION"; payload: Array<AnnotationId> }
  | {
      type: "MOVE_ANNOTATION";
      payload: { id: AnnotationId; x: number; y: number };
    }
  | {
      type: "RESIZE_ANNOTATION";
      payload: {
        id: AnnotationId;
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }
  | {
      type: "SELECT_ANNOTATION";
      payload: AnnotationId;
    }
  | {
      type: "DESELECT_ANNOTATION";
      payload: AnnotationId;
    }
  | {
      type: "DESELECT_ALL_ANNOTATION";
    }
  | {
      type: "HYDRATE_STORE";
      payload: AccessibleForm;
    }
  | {
      type: "SET_ANNOTATION_TYPE";
      payload: { ids: Array<AnnotationId>; type: ANNOTATION_TYPE };
    }
  | {
      type: "SET_STEP";
      payload: number;
    }
  | {
      type: "CREATE_RELATION";
      payload: {
        // FIXME: from and to represent directional relationships. Should
        // it be this way ?
        from: AnnotationId;
        to: AnnotationId | Array<AnnotationId>;
      };
    }
  | {
      type: "UNDO";
    }
  | {
      type: "REDO";
    };

// reduceAccessibleForm determines how to update the state after a UI action
// takes place. It is *intentionally* very big and relies on pattern matching
// the type we encounter above.
//
// This function is pure even though it appears to contain mutating logic thanks
// to the immer library. immer takes care of cloning the previous state for us
// so that we don't need to worry about using the spread operator everywhere;
// we can just mutate the draft state to look the way we'd like, and immer will
// handle making copies of everything.

const MAX_VERSION = 10;

type Producer = (draft: AccessibleForm) => void;

const produceWithUndo = (previous: AccessibleForm, producer: Producer) => {
  const [nextState, patches, inversePatches] = produceWithPatches(
    previous,
    producer
  );
  return produce(nextState, (draft) => {
    draft.canRedo = false;
    draft.canUndo = true;
    draft.currentVersion += 1;
    draft.versions[draft.currentVersion] = {
      undo: inversePatches,
      redo: patches,
    };
    delete draft.versions[draft.currentVersion + 1];
    delete draft.versions[draft.currentVersion - MAX_VERSION];
  });
};

export const reduceAccessibleForm = (
  previous: AccessibleForm | undefined,
  action: AccessibleFormAction
): AccessibleForm => {
  if (previous === undefined) return DEFAULT_ACCESSIBLE_FORM;
  switch (action.type) {
    case "CHANGE_CURRENT_STEP": {
      return produce(previous, (draft) => {
        draft.step = action.payload;
      });
    }
    case "CHANGE_ZOOM": {
      return produce(previous, (draft) => {
        const previousZoom = draft.zoom;
        draft.zoom = action.payload;
        const annotationIds = Object.keys(draft.annotations);
        const scale = action.payload / previousZoom;
        for (const annotationId of annotationIds) {
          const annotation = draft.annotations[annotationId];
          annotation.left *= scale;
          annotation.top *= scale;
          annotation.height *= scale;
          annotation.width *= scale;
        }
        for (const pageTokens of draft.tokens) {
          for (const token of pageTokens) {
            token.left *= scale;
            token.top *= scale;
            token.height *= scale;
            token.width *= scale;
          }
        }
        return;
      });
    }
    case "CHANGE_TOOL": {
      return produce(previous, (draft) => {
        draft.tool = action.payload;
        return;
      });
    }
    case "CHANGE_PAGE": {
      return produce(previous, (draft) => {
        draft.page = action.payload;
        return;
      });
    }
    case "CREATE_ANNOTATION": {
      return produceWithUndo(previous, (draft) => {
        draft.annotations[action.payload.id] = action.payload;
        return;
      });
    }
    case "CREATE_ANNOTATION_FROM_TOKENS": {
      return produce(previous, (draft) => {
        draft.annotations[action.payload.ui.id] = {
          ...action.payload.ui,
          ...boxContaining(action.payload.tokens, 3),
        };
      });
    }
    case "MOVE_ANNOTATION": {
      return produce(previous, (draft) => {
        const annotation = draft.annotations[action.payload.id];
        annotation.left = action.payload.x;
        annotation.top = action.payload.y;
        return;
      });
    }
    case "RESIZE_ANNOTATION": {
      return produce(previous, (draft) => {
        const annotation = draft.annotations[action.payload.id];
        annotation.width = action.payload.width;
        annotation.height = action.payload.height;
        annotation.top = action.payload.y;
        annotation.left = action.payload.x;
        return;
      });
    }
    case "DELETE_ANNOTATION": {
      return produceWithUndo(previous, (draft) => {
        action.payload.forEach((id) => {
          delete draft.annotations[id];
        });
        return;
      });
    }
    case "SELECT_ANNOTATION": {
      return produce(previous, (draft) => {
        draft.selectedAnnotations[action.payload] = true;
        return;
      });
    }
    case "DESELECT_ANNOTATION": {
      return produce(previous, (draft) => {
        delete draft.selectedAnnotations[action.payload];
        return;
      });
    }
    case "DESELECT_ALL_ANNOTATION": {
      return produce(previous, (draft) => {
        draft.selectedAnnotations = {};
        return;
      });
    }
    case "HYDRATE_STORE": {
      return produce(action.payload, (draft) => {
        // NOTE: Depending on the size of the screen, our token data can be off by a factor of
        // two. To handle the problem at runtime since we're testing remotely and we don't know
        // the user's screen size, we multiply by 2 when the screen is sufficiently small so that
        // we don't have the problem.
        //
        // TODO: If there is away to avoid this clever trick, please let us know!
        const scale = window.innerWidth < 1800 ? 2 : 1;
        const annotationIds = Object.keys(draft.annotations);
        for (const annotationId of annotationIds) {
          const annotation = draft.annotations[annotationId];
          annotation.left *= scale;
          annotation.top *= scale;
          annotation.height *= scale;
          annotation.width *= scale;
        }
        for (const pageTokens of draft.tokens) {
          for (const token of pageTokens) {
            token.left *= scale;
            token.top *= scale;
            token.height *= scale;
            token.width *= scale;
          }
        }
        return;
      });
    }
    case "SET_ANNOTATION_TYPE": {
      return produceWithUndo(previous, (draft) => {
        action.payload.ids.forEach((id) => {
          const annotation = draft.annotations[id];
          annotation.type = action.payload.type;
        });
        return;
      });
    }
    case "SET_STEP": {
      // TODO: When step changes we might want to clean undo and redo. So, that
      // users don't accidently undo or redo steps out of their view.
      return produce(previous, (draft) => {
        draft.step = action.payload;
        // When user moves to a new page we want "SELECT" tool to be selected as
        // it is the default tool which is present on all pages.
        draft.tool = "SELECT";
      });
    }
    case "CREATE_RELATION": {
      return produceWithUndo(previous, (draft) => {
        draft.relations[action.payload.from] = action.payload.to;
        return;
      });
    }
    case "UNDO": {
      const tmp = applyPatches(
        previous,
        previous.versions[previous.currentVersion].undo
      );
      return produce(tmp, (draft) => {
        draft.canUndo = Boolean(draft.versions[draft.currentVersion - 1]);
        draft.canRedo = true;
        draft.currentVersion -= 1;
        return;
      });
    }
    case "REDO": {
      const tmp = applyPatches(
        previous,
        previous.versions[previous.currentVersion + 1].redo
      );
      return produce(tmp, (draft) => {
        draft.canUndo = true;
        draft.canRedo = Boolean(previous.versions[draft.currentVersion + 2]);
        draft.currentVersion += 1;
        return;
      });
    }
  }
};

//  ____                 _   ____          _
// |  _ \ ___  __ _  ___| |_|  _ \ ___  __| |_   ___  __
// | |_) / _ \/ _` |/ __| __| |_) / _ \/ _` | | | \ \/ /
// |  _ <  __/ (_| | (__| |_|  _ <  __/ (_| | |_| |>  <
// |_| \_\___|\__,_|\___|\__|_| \_\___|\__,_|\__,_/_/\_\

const store = createStore(reduceAccessibleForm, devToolsEnhancer());

const StoreProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  return <Provider store={store}>{children}</Provider>;
};

// See https://react-redux.js.org/using-react-redux/usage-with-typescript#define-typed-hooks
export const useSelector: TypedUseSelectorHook<AccessibleForm> =
  useSelectorRedux;

export const useDispatch = () => useDispatchRedux<typeof store.dispatch>();

export default StoreProvider;
