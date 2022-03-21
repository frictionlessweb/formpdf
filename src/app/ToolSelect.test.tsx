import ToolSelect from "./ToolSelect";
import { render } from "@testing-library/react";

describe("Our ToolSelect component", () => {
  test("Does not crash on rendering", () => {
    render(<ToolSelect />);
  });
});
