import ToolSelect from "./ToolSelect";
import { render } from "../testUtils";

describe("Our ToolSelect component", () => {
  test("Does not crash on rendering", () => {
    render(<ToolSelect />);
  });
});
