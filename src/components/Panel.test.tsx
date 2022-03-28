import Panel from "./Panel";
import { render } from "../testUtils";

describe("Our Panel component", () => {
  test("Does not crash on rendering", () => {
    render(<Panel />);
  });
});
