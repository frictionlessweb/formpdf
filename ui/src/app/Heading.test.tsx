import Heading from "./Heading";
import { render } from "../testUtils";

describe("Our Heading component", () => {
  test("Does not crash on rendering", () => {
    render(<Heading />);
  });
});
