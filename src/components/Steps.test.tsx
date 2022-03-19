import Steps from "./Steps";
import { render } from "@testing-library/react";

describe("Our Steps component", () => {
  test("Does not crash on rendering", () => {
    render(<Steps activeStep={0} />);
  });
});
