import PDF from "./PDF";
import { render, act } from "../testUtils";

describe("Our PDF component", () => {
  test("Does not crash on rendering", async () => {
    await act(async () => {
      render(<PDF url="" width={500} height={500} currentPage={1} zoom={1} />);
    });
  });
});
