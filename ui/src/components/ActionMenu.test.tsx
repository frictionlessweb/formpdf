import { FieldLayerActionMenu } from "./ActionMenu";
import { render } from "../testUtils";

describe("Our FieldLayerActionMenu component", () => {
  test("Does not crash on rendering", () => {
    render(
      <FieldLayerActionMenu
        position={{ top: 0, left: 0 }}
        value={"TEXTBOX"}
        onDelete={() => {}}
        onFieldTypeChange={() => {}}
      />
    );
  });
});
