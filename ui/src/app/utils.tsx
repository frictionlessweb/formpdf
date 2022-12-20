import React from "react";
import {
  useSelector,
  useDispatch,
  AccessibleForm,
  DEFAULT_ACCESSIBLE_FORM,
  Bounds,
} from "./StoreProvider";
import TOKENS_1 from "./tokens/tokens_1.json";
import TOKENS_2 from "./tokens/tokens_2.json";
import TOKENS_3 from "./tokens/tokens_3.json";
import TOKENS_4 from "./tokens/tokens_4.json";
import PREDICTIONS_1 from "./predictions/predictions_1.json";
import PREDICTIONS_2 from "./predictions/predictions_2.json";
import PREDICTIONS_3 from "./predictions/predictions_3.json";
import PREDICTIONS_4 from "./predictions/predictions_4.json";

const LOCAL_STORAGE_KEY = "a11yform";
const SAVE_INTERVAL = 1000;

const saveToLocalStorage = (state: AccessibleForm) => {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
};

const fetchFromLocalStorage = (): AccessibleForm => {
  const state = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (state === null) return DEFAULT_ACCESSIBLE_FORM;
  return JSON.parse(state);
};

export const useSaveState = () => {
  const state = useSelector((store) => store);
  const dispatch = useDispatch();
  React.useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage(state);
    }, SAVE_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [state]);
  React.useEffect(() => {
    const store = fetchFromLocalStorage();
    dispatch({ type: "HYDRATE_STORE", payload: store });
  }, [dispatch]);
};

// See https://github.com/allenai/pawls/blob/3cc57533248e7ca787b71cafcca5fb66e96b2166/ui/src/context/PDFStore.ts#L31
export const boxContaining = (tokens: Bounds[], padding: number): Bounds => {
  let left = Number.MAX_VALUE;
  let top = Number.MAX_VALUE;
  let right = 0;
  let bottom = 0;
  for (const token of tokens) {
    top = Math.min(token.top, top);
    left = Math.min(token.left, left);
    right = Math.max(token.left + token.width, right);
    bottom = Math.max(token.top + token.height, bottom);
  }
  const width = right - left;
  const height = bottom - top;
  return {
    top: top - padding,
    left: left - padding,
    width: width + 2 * padding,
    height: height + 2 * padding,
  };
};

// i feel sorry for writing all this code. I know there's a better way to do this.
export const getPredictionsAndTokens = () => {
  switch (window.location.hash) {
    case "#1":
      return [PREDICTIONS_1, TOKENS_1];
    case "#2":
      return [PREDICTIONS_2, TOKENS_2];
    case "#3":
      return [PREDICTIONS_3, TOKENS_3];
    case "#4":
      return [PREDICTIONS_4, TOKENS_4];
    default:
      return [PREDICTIONS_1, TOKENS_1];
  }
};

export const getPdfUrl = () => {
  switch (window.location.hash) {
    case "#1":
      return "form_1.pdf";
    case "#2":
      return "form_2.pdf";
    case "#3":
      return "form_3.pdf";
    case "#4":
      return "form_4.pdf";
    default:
      return "form_1.pdf";
  }
};

// const fetchNewAnnotations = async (step: Step) => {
//     dispatch({ type: "SHOW_LOADING_SCREEN" });
//     const res = await window.fetch(
//       `${process.env.REACT_APP_API_PATH || ""}/annotations`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ pages, width, height }),
//       }
//     );
//     const { annotations } = await res.json();
//     dispatch({
//       type: "CHANGE_STEP_AND_ANNOTATIONS",
//       payload: {
//         step,
//         annotations,
//       },
//     });
//   };
