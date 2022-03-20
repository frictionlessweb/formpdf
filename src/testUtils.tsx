import React from "react";
import { render } from "@testing-library/react";
import { reduceAccessibleForm } from "./app/AccessibleForm";
import { createStore } from "redux";
import { Provider } from "react-redux";

const Providers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const store = createStore(reduceAccessibleForm);
  return <Provider store={store}>{children}</Provider>;
};

// @ts-ignore
const customRender: typeof render = (ui, options) => {
  return render(ui, { wrapper: Providers, ...options });
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
