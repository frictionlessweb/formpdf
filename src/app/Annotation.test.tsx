import Annotation, {
  mapCreationBoundsToCss,
  mapCreationBoundsToFinalBounds,
  doOverlap,
} from "./Annotation";
import { render } from "../testUtils";

describe("Our Annotation component", () => {
  test("Does not crash on rendering", () => {
    render(
      <Annotation
        type="TEXTBOX"
        left={0}
        top={0}
        width={10}
        height={10}
        backgroundColor="hotpink"
        border="3px solid pink"
        id="234"
      />
    );
  });
});

describe("doOverlap", () => {
  test("Is true when they do overlap", () => {
    expect(
      doOverlap(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 0, top: 0, width: 5, height: 5 }
      )
    ).toBeTruthy();
  });
  test("Is false when they don't overlap", () => {
    expect(
      doOverlap(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 100, top: 100, width: 10, height: 10 }
      )
    ).toBeFalsy();
  });
});

describe("Bounding CSS", () => {
  test("Works in the happy path", () => {
    const res = mapCreationBoundsToCss({
      left: 0,
      top: 0,
      movedLeft: 10,
      movedTop: 10,
    });
    expect(res.width).toEqual(10);
    expect(res.height).toEqual(10);
    expect(res.transform!.includes("-180")).toBe(false);
  });
  test("Works if the user moves their cursor above/left", () => {
    const res = mapCreationBoundsToCss({
      left: 10,
      top: 10,
      movedLeft: 0,
      movedTop: 0,
    });
    expect(res.width).toEqual(10);
    expect(res.height).toEqual(10);
    expect(res.transform!.includes("-180")).toBe(true);
  });
});

describe("Bounding on create", () => {
  test("Works on the happy path", () => {
    const res = mapCreationBoundsToFinalBounds({
      left: 0,
      top: 0,
      movedLeft: 10,
      movedTop: 10,
    });
    expect(res.width).toEqual(10);
    expect(res.height).toEqual(10);
    expect(res.left).toBe(0);
    expect(res.top).toBe(0);
  });
  test("Works if the user moves their cursor above/left", () => {
    const res = mapCreationBoundsToFinalBounds({
      left: 10,
      top: 10,
      movedLeft: 0,
      movedTop: 0,
    });
    expect(res.width).toEqual(10);
    expect(res.height).toEqual(10);
    expect(res.left).toBe(0);
    expect(res.top).toBe(0);
  });
});
