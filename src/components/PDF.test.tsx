import PDF from "./PDF";
import { render } from "@testing-library/react";

describe("Our PDF component", () => {
  test("Does not crash on rendering", () => {
    render(<PDF />);
  });
});
