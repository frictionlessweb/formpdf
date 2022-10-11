import Steps from "./Steps";
import { render } from "../testUtils";

describe("Our Steps component", () => {
  test("Does not crash on rendering", () => {
    render(
      <Steps
        onStepChange={() => {}}
        activeStep="LABEL_LAYER"
        activeTool="CREATE"
      />
    );
  });
});
