import Annotation, { makeContainerStyles } from "./Annotation";
import { render } from "../testUtils";

describe("Our Annotation component", () => {
  test("Does not crash on rendering", () => {
    render(
      <Annotation
        id="5"
        draggable
        resizable
        backgroundColor="hotpink"
        height={30}
        width={30}
        top={0}
        left={30}
        zoom={1}
      />
    );
  });
  test("Has the right cursor when draggable", () => {
    expect(
      makeContainerStyles({
        draggable: true,
        zoom: 1,
        left: 1,
        top: 1,
        width: 1,
        height: 1,
        backgroundColor: "hotpink",
        resizable: false,
        id: "5",
      }).cursor
    ).toBe("move");
  });
});
