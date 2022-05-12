import ProceedToNextLayer from "./ProceedToNextLayer";
import { render } from "../testUtils";

describe("Our ProceedToNextLayer component", () => {
  test("Does not crash on rendering", () => {
    render(<ProceedToNextLayer />);
  });
});
