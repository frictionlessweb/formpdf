import { render, act } from "./testUtils";
import App from "./App";

test("Does not crash immediately", async () => {
  await act(async () => {
    render(<App />);
  });
});
