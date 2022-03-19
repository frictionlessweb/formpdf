import { render, act } from "@testing-library/react";
import App from "./App";

test("Does not crash immediately", async () => {
  await act(async () => {
    render(<App />);
  });
});
