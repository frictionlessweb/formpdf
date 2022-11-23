import { Zoom } from "./Zoom";
import { render } from "../testUtils";

describe("Our Zoom component", () => {
  test("Does not crash on rendering", () => {
    render(<Zoom />);
  });
});
