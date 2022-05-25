import UndoAndRedo from "./UndoAndRedo";
import { render } from "../testUtils";

describe("Our UndoAndRedo component", () => {
  test("Does not crash on rendering", () => {
    render(<UndoAndRedo />);
  });
});
