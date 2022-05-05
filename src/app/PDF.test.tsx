import PDF from "./PDF";
import { render, act } from "../testUtils";

describe("Our PDF component", () => {
  test("Does not crash on rendering", async () => {
    await act(async () => {
      render(<PDF url="" />);
    });
  });
});
