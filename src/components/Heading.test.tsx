import Heading from "./Heading";
import { render } from "@testing-library/react";

describe("Our Heading component", () => {
  test("Does not crash on rendering", () => {
    render(<Heading />);
  });
});
