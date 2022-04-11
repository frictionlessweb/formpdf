import React from "react";
import {
  useSelector,
  useDispatch,
  AccessibleForm,
  DEFAULT_ACCESSIBLE_FORM,
  Bounds,
} from "./StoreProvider";

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
    width: width + padding,
    height: height + padding,
  };
};
