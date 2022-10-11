import React from "react";
import produce, {
  enablePatches,
  applyPatches,
  produceWithPatches,
  Patch,
} from "immer";
import { createStore, applyMiddleware } from "redux";
import {
  Provider,
  useSelector as useSelectorRedux,
  useDispatch as useDispatchRedux,
  TypedUseSelectorHook,
} from "react-redux";
import { createLogger } from "redux-logger";
import { boxContaining, getPredictionsAndTokens } from "./utils";
import { composeWithDevTools } from "@redux-devtools/extension";
import color from "../components/color";
const PDF_HEIGHT = 2200;
const PDF_WIDTH = 1700;

const [PREDICTIONS, TOKENS] = getPredictionsAndTokens();

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
export type ANNOTATION_TYPE =
  | "TEXTBOX"
  | "RADIOBOX"
  | "CHECKBOX"
  | "LABEL"
  | "GROUP"
  | "GROUP_LABEL";

export type AnnotationUIState = {
  // What is the ID of the annotation -- how do we uniquely identify it?
  id: AnnotationId;
  // What is the color of the annotation?
  backgroundColor: string;
  // What is the border of the annotation?
  border: string;
  // What is the the type of the annotation?
  type: ANNOTATION_TYPE;
  // On which page should we show this annotation?
  page: number;
  // Has the user modified this annotation?
  corrected: boolean;
};

export type Annotation = Bounds & AnnotationUIState;

export type ApiAnnotation = Bounds & {
  // What is the ID of this annotation?
  id: AnnotationId;
  // What is the type of this annotation?
  type: ANNOTATION_TYPE;
};

export type Step =
  | "SECTION_LAYER"
  | "FIELD_LAYER"
  | "LABEL_LAYER"
  | "GROUP_LAYER";

interface StepDescription {
  // Which step are we referring to?
  id: Step;
  // What is the title of the current step?
  title: string;
  // What is the description of the current step?
  description: string;
}

export const STEPS: Array<StepDescription> = [
  {
    id: "SECTION_LAYER",
    title: "Section",
    description:
      "Choose size of the section using the Handle. Ensure that fields or groups are not cut off in half .",
  },
  {
    id: "FIELD_LAYER",
    title: "Fields",
    description:
      "Ensure form fields are marked by a box and have a field type. If not, use Create Tool.",
  },
  {
    id: "LABEL_LAYER",
    title: "Labels",
    description:
      "Ensure form fields have label. If not, select the field and Update Label.",
  },
  {
    id: "GROUP_LAYER",
    title: "Groups",
    description:
      "Ensure the checkbox and radiobox are grouped properly and have labels. If not, select boxes and Create New Group. ",
  },
];

// Children of the PDF need to know where it is in the DOM, so we pass these
// references down to make sure they can perform the appropriate calculations.
export interface LayerControllerProps {
  // Where is the current PDF in the DOM?
  pdf: React.MutableRefObject<HTMLCanvasElement | null>;
  // Where is the container of the PDF in the DOM?
  container: React.MutableRefObject<HTMLDivElement | null>;
}

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

// This contains metadata related to each section user has created.
export interface Section {
  // What is the Y position of the section?
  y: number;
}

type VersionId = number;

export interface AccessibleForm {
  // What step is the user on of their editing process?
  step: Step;
  // How far has the user Zoomed in or out of the PDF?
  zoom: number;
  // Which page of the PDF are we on? WARNING: This is indexed from *1*, not
  // from zero!
  page: number;
  // What is the height of the PDF document?
  pdfHeight: number;
  // What is the width of the PDF document?
  pdfWidth: number;
  // What are all different sections that user has created?
  sections: Array<Section>;
  // Users can move between sections, this keeps a track on which section they are. It starts from 0.
  currentSection: number;
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
  // How are field and labels related to each other?
  labelRelations: Record<AnnotationId, AnnotationId>;
  // Which set of fields form a group together
  groupRelations: Record<AnnotationId, Array<AnnotationId>>;
  // Different screens can render tokens differently, so we need to account for
  // that and remember when we have/have not scaled them.
  haveScaled: boolean;
  // Should we be displaying the modal that asks the user whether they want to
  // go back to resizing the form?
  showResizeModal: boolean;
  // Should we display a generic screen instead of the pdf?
  showLoadingScreen: boolean;
}

export const ANNOTATION_COLOR = color.orange.transparent;

export const ANNOTATION_BORDER = `4px solid ${color.orange.dark}`;

const Borders: Record<ANNOTATION_TYPE, string> = {
  TEXTBOX: `4px solid ${color.orange.dark}`,
  CHECKBOX: `4px solid ${color.orange.dark}`,
  RADIOBOX: `4px solid ${color.orange.dark}`,
  LABEL: `4px solid ${color.teal.medium}`,
  GROUP: `4px solid ${color.teal.medium}`,
  GROUP_LABEL: `4px solid ${color.teal.medium}`,
};

const BackgroundColors: Record<ANNOTATION_TYPE, string> = {
  TEXTBOX: color.orange.transparent,
  CHECKBOX: color.orange.transparent,
  RADIOBOX: color.orange.transparent,
  LABEL: color.teal.transparent,
  GROUP: color.teal.transparent,
  GROUP_LABEL: color.teal.transparent,
};

// This function grabs the prediction from prediction.json, creates
// annotation out of them and its output is used to populate annotations
// in DEFAULT_ACCESSIBLE_FORM.
const getPredictedAnnotations = (pdfHeight: number) => {
  const predictedAnnotations: Record<AnnotationId, Annotation> = {};
  PREDICTIONS.forEach((page, pageNumber) => {
    page.forEach((prediction) => {
      const { top, left, width, height } = prediction;
      // Currently this is manually set, later will come from prediction.json
      const type = "TEXTBOX";
      // @ts-ignore
      const id: AnnotationId = window.crypto.randomUUID();
      predictedAnnotations[id] = {
        id,
        border: Borders[type],
        backgroundColor: BackgroundColors[type],
        type,
        top: top + pdfHeight * pageNumber,
        left,
        width,
        height,
        page: pageNumber + 1,
        corrected: false,
      };
    });
  });
  return predictedAnnotations;
};

export const DEFAULT_ACCESSIBLE_FORM: AccessibleForm = {
  step: "SECTION_LAYER",
  tool: "CREATE",
  zoom: 1,
  page: 1,
  pdfHeight: PDF_HEIGHT,
  pdfWidth: PDF_WIDTH,
  showResizeModal: false,
  currentSection: 0,
  sections: [{ y: 300 }],
  annotations: getPredictedAnnotations(PDF_HEIGHT),
  selectedAnnotations: {},
  canRedo: false,
  canUndo: false,
  currentVersion: -1,
  versions: {},
  tokens: TOKENS,
  labelRelations: {},
  groupRelations: {},
  haveScaled: false,
  showLoadingScreen: false,
};

// AccessibleFormAction describes every important possible action that a user
// could take while editing the PDF UI.
export type AccessibleFormAction =
  | { type: "CHANGE_CURRENT_STEP"; payload: Step }
  | { type: "SET_CURRENT_SECTION"; payload: number }
  | { type: "GOTO_NEXT_STEP" }
  | { type: "GOTO_PREVIOUS_STEP"; payload: Step }
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
      type: "MOVE_SECTION_SLIDER";
      payload: number;
    }
  | {
      type: "JUMP_BACK_TO_FIELD_LAYER";
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
      payload: Step;
    }
  | {
      type: "INCREMENT_STEP_AND_GET_ANNOTATIONS";
      payload: {
        annotations: Array<Array<ApiAnnotation>>;
        groupRelations: Record<AnnotationId, AnnotationId[]>;
        labelRelations: Record<AnnotationId, AnnotationId>;
      };
    }
  | {
      type: "CREATE_LABEL_RELATION";
      payload: {
        to: {
          ui: AnnotationUIState;
          tokens: Bounds[];
        };
        from: AnnotationId;
      };
    }
  | {
      type: "CREATE_GROUP_RELATION";
      payload: {
        from: {
          ui: {
            id: string;
            backgroundColor: string;
            border: string;
            type: "GROUP";
          };
          tokens: Bounds[];
        };
        to: Array<AnnotationId>;
      };
    }
  | {
      type: "DELETE_GROUP";
      payload: AnnotationId;
    }
  | {
      type: "UPDATE_SECTION";
      payload: Section;
    }
  | {
      type: "CREATE_NEW_SECTION";
    }
  | {
      type: "UNDO";
    }
  | {
      type: "REDO";
    }
  | { type: "SHOW_LOADING_SCREEN" };

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
    case "GOTO_PREVIOUS_STEP": {
      return produceWithUndo(previous, (draft) => {
        const currentStep = STEPS.findIndex((aStep) => aStep.id === draft.step);
        if (currentStep === -1) return;
        const previousStep = STEPS.findIndex(
          (aStep) => aStep.id === action.payload
        );
        if (previousStep === -1) return;
        if (previousStep < currentStep) {
          draft.step = action.payload;
        }
      });
    }
    case "GOTO_NEXT_STEP": {
      return produceWithUndo(previous, (draft) => {
        const idx = STEPS.findIndex((aStep) => aStep.id === draft.step);
        if (idx === -1) return;
        const nextStep = STEPS[idx + 1]?.id;
        if (nextStep === undefined) return;
        draft.step = nextStep;
        draft.tool = "SELECT";
      });
    }
    case "SHOW_LOADING_SCREEN": {
      return produce(previous, (draft) => {
        draft.showLoadingScreen = true;
      });
    }
    case "CHANGE_CURRENT_STEP": {
      return produce(previous, (draft) => {
        draft.step = action.payload;
      });
    }
    case "JUMP_BACK_TO_FIELD_LAYER": {
      return produce(previous, (draft) => {
        draft.step = "FIELD_LAYER";
        draft.showResizeModal = false;
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
        for (const section of draft.sections) {
          section.y *= scale;
        }
        draft.pdfHeight = draft.pdfHeight * scale;
        draft.pdfWidth = draft.pdfWidth * scale;
        return;
      });
    }
    case "CHANGE_TOOL": {
      return produceWithUndo(previous, (draft) => {
        draft.tool = action.payload;
        return;
      });
    }
    case "MOVE_SECTION_SLIDER": {
      return produceWithUndo(previous, (draft) => {
        draft.sections[draft.currentSection].y = action.payload;
        if (draft.step === "SECTION_LAYER" || draft.step === "FIELD_LAYER") {
          // If we're in the section layer or field layer, we don't need to
          // show the resize modal. Section layer is obvious. Field layer is
          // where we are directed after users uses resize hande. So it doesn't
          // make sense to show resize modal asking user to go to field layer,
          // when they are already on field layer.
          return;
        } else {
          draft.showResizeModal = true;
        }
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
    case "DELETE_GROUP": {
      return produceWithUndo(previous, (draft) => {
        const theGroupId = draft.labelRelations[action.payload];
        delete draft.labelRelations[action.payload];
        delete draft.groupRelations[theGroupId];
        delete draft.annotations[action.payload];
        delete draft.annotations[theGroupId];
        draft.selectedAnnotations = {};
      });
    }
    case "CREATE_ANNOTATION_FROM_TOKENS": {
      if (action.payload.tokens.length === 0) return previous;
      return produce(previous, (draft) => {
        draft.annotations[action.payload.ui.id] = {
          ...action.payload.ui,
          ...boxContaining(action.payload.tokens, 3),
        };
      });
    }
    case "MOVE_ANNOTATION": {
      return produceWithUndo(previous, (draft) => {
        const annotation = draft.annotations[action.payload.id];
        annotation.left = action.payload.x;
        annotation.top = action.payload.y;
        return;
      });
    }
    case "RESIZE_ANNOTATION": {
      // we are not adding undo here because reisizing dispatches a large number of
      // resize events. Maybe we can fix this in future.
      return produce(previous, (draft) => {
        const annotation = draft.annotations[action.payload.id];
        annotation.width = action.payload.width;
        annotation.height = action.payload.height;
        annotation.top = action.payload.y;
        annotation.left = action.payload.x;
        annotation.corrected = true;
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
      if (action.payload.haveScaled) return action.payload;
      return produce(action.payload, (draft) => {
        // This scale variable might be required in the future, when scaling differs for different inputs.
        const scale = 1;
        // TODO: Why are we using 1216 X 1577, maybe it was size of canvas before.
        // const scaleX = 1216 / 1700;
        // const scaleY = 1577 / 2200;
        const annotationIds = Object.keys(draft.annotations);
        for (const annotationId of annotationIds) {
          const annotation = draft.annotations[annotationId];
          annotation.left *= scale;
          annotation.top *= scale;
          annotation.height *= scale;
          annotation.width *= scale;
        }
        for (let i = 0; i < draft.tokens.length; ++i) {
          const pageTokens = draft.tokens[i];
          for (const token of pageTokens) {
            token.left *= scale;
            token.top *= scale;
            token.top += i * (draft.pdfHeight / scale);
            token.height *= scale;
            token.width *= scale;
          }
        }
        draft.haveScaled = true;
      });
    }
    case "SET_ANNOTATION_TYPE": {
      return produceWithUndo(previous, (draft) => {
        action.payload.ids.forEach((id) => {
          const annotation = draft.annotations[id];
          annotation.type = action.payload.type;
          annotation.corrected = true;
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
    // This case was used originally to get annotation values from server. This is obselete now.
    case "INCREMENT_STEP_AND_GET_ANNOTATIONS": {
      return produce(previous, (draft) => {
        const newAnnotations: Record<AnnotationId, Annotation> = {};
        // All incoming annotations from file are at a scale of 1. So, we need to scale them to the
        // current scale in UI or the store. If we don't do this, then annotations will be shown in
        // 100% zoom level, irrespective of zoom level of the UI.
        const scale = draft.zoom;
        for (let i = 0; i < action.payload.annotations.length; ++i) {
          const page = action.payload.annotations[i];
          for (const annotation of page) {
            newAnnotations[annotation.id as AnnotationId] = {
              id: annotation.id,
              type: annotation.type,
              width: annotation.width * scale,
              height: annotation.height * scale,
              top: annotation.top * scale,
              left: annotation.left * scale,
              border: Borders[annotation.type],
              backgroundColor: BackgroundColors[annotation.type],
              page: i + 1,
              corrected: false,
            };
          }
        }
        draft.showLoadingScreen = false;
        draft.annotations = newAnnotations;
        draft.tool = "SELECT";
        const idx = STEPS.findIndex((aStep) => aStep.id === draft.step);
        if (idx === -1) return;
        const nextStep = STEPS[idx + 1]?.id;
        if (nextStep === undefined) return;
        draft.step = nextStep;
        draft.labelRelations = action.payload.labelRelations;
        draft.groupRelations = action.payload.groupRelations;
      });
    }
    case "CREATE_LABEL_RELATION": {
      if (action.payload.to.tokens.length === 0) return previous;
      const res = produceWithUndo(previous, (draft) => {
        Object.keys(draft.labelRelations).forEach((key) => {
          if (draft.labelRelations[key] === action.payload.from) {
            delete draft.annotations[key];
            delete draft.labelRelations[key];
          }
        });
        draft.annotations[action.payload.to.ui.id] = {
          ...action.payload.to.ui,
          ...boxContaining(action.payload.to.tokens, 3),
          corrected: true,
        };
        draft.labelRelations[action.payload.to.ui.id] = action.payload.from;
        draft.tool = "SELECT";
        draft.selectedAnnotations = {};
        return;
      });
      return res;
    }
    case "CREATE_GROUP_RELATION": {
      if (action.payload.from.tokens.length === 0) return previous;
      return produceWithUndo(previous, (draft) => {
        draft.annotations[action.payload.from.ui.id] = {
          ...action.payload.from.ui,
          ...boxContaining(action.payload.from.tokens, 3),
          corrected: true,
          page: draft.page,
        };
        draft.groupRelations[action.payload.from.ui.id] = action.payload.to;
        draft.selectedAnnotations = { [action.payload.from.ui.id]: true };
        draft.tool = "CREATE";
        return;
      });
    }
    case "SET_CURRENT_SECTION": {
      return produceWithUndo(previous, (draft) => {
        draft.currentSection = action.payload;
        draft.step = "SECTION_LAYER";
        draft.tool = "SELECT";
        return;
      });
    }
    case "CREATE_NEW_SECTION": {
      return produceWithUndo(previous, (draft) => {
        const currentSection = draft.currentSection;
        draft.sections.push({
          y: draft.sections[currentSection].y + 300,
        });
        draft.currentSection = currentSection + 1;
        draft.step = "SECTION_LAYER";
        draft.tool = "SELECT";
        return;
      });
    }
    // This is not being used right now.
    case "UPDATE_SECTION": {
      return produceWithUndo(previous, (draft) => {
        const currentSection = draft.currentSection;
        draft.sections[currentSection] = action.payload;
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

const logger = createLogger({ collapsed: true });

const store =
  process.env.NODE_ENV === "production"
    ? createStore(reduceAccessibleForm)
    : createStore(
        reduceAccessibleForm,
        composeWithDevTools(applyMiddleware(logger))
      );

const StoreProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  return <Provider store={store}>{children}</Provider>;
};

// See https://react-redux.js.org/using-react-redux/usage-with-typescript#define-typed-hooks
export const useSelector: TypedUseSelectorHook<AccessibleForm> =
  useSelectorRedux;

export const useDispatch = () => useDispatchRedux<typeof store.dispatch>();

export default StoreProvider;
