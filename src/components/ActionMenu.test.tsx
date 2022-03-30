import { FieldLayerActionMenu } from "./ActionMenu";
import { render } from "../testUtils";

describe("Our FieldLayerActionMenu component", () => {
  test("Does not crash on rendering", () => {
    render(
      <FieldLayerActionMenu onDelete={() => {}} onFieldTypeChange={() => {}} />
    );
  });
});
