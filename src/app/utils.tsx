import React from "react";
import {
  useSelector,
  useDispatch,
  AccessibleForm,
  DEFAULT_ACCESSIBLE_FORM,
} from "./AccessibleForm";

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
