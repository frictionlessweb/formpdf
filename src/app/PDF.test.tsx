import PDF, { larvalContainerCss } from "./PDF";
import { render, act } from "../testUtils";

describe("Our PDF component", () => {
  test("Does not crash on rendering", async () => {
    await act(async () => {
      render(<PDF url="" width={500} height={500} />);
    });
  });
});

describe("Creating the CSS for a larval annotation", () => {
  test("Does not flip if right > left", () => {
    const res = larvalContainerCss({ right: 2, left: 1, bottom: 2, top: 1 });
    expect(res.transform?.includes("180")).toBe(false);
  });
  test("Does flip if right < left", () => {
    const res = larvalContainerCss({ right: 0, left: 1, bottom: 0, top: 1 });
    expect(res.transform?.includes("180")).toBe(true);
  });
  test("We keep width/height greater than 0", () => {
    const res = larvalContainerCss({ right: 0, left: 1, bottom: 0, top: 1 });
    expect((res?.width || 0) > 0).toBe(true);
    expect((res?.height || 0) > 0).toBe(true);
  });
});
