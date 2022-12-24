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
import SAVED_STATE_FORM_1 from "./savedStates/form_1.json";
import SAVED_STATE_FORM_2 from "./savedStates/form_2.json";
import SAVED_STATE_FORM_4 from "./savedStates/form_4.json";

import { SelectChangeEvent } from "@mui/material";

export const LOCAL_STORAGE_KEY = "a11yform";

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
    // this runs first when page reload happens
    const store = fetchFromLocalStorage();
    dispatch({ type: "HYDRATE_STORE", payload: store });
  }, [dispatch]);
  React.useEffect(() => {
    // this starts second when page reloads
    saveToLocalStorage(state);
  }, [state]);
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

export const handleFormChange = (e: SelectChangeEvent<string>) => {
  // we clear the current state present in local storage,
  // window.localStorage.clear();
  switch (Number(e.target.value)) {
    case 1: {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(SAVED_STATE_FORM_1)
      );
      break;
    }
    case 2: {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(SAVED_STATE_FORM_2)
      );
      break;
    }
    case 4: {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(SAVED_STATE_FORM_4)
      );
      break;
    }
    default:
      window.localStorage.clear();
  }
  // resetting href reloads page and new state is loaded automatically from the URL.
  window.location.href = window.location.origin + "#" + e.target.value;
  window.location.reload();
};
