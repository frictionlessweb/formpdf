import { render } from "@testing-library/react";
import App from "./App";

test("Does not crash immediately", () => {
  render(<App />);
});
