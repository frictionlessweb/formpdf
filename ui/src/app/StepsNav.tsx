/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import { useSelector, useDispatch, Step } from "./StoreProvider";

const useStepsNav = () => {
  const { activeStep, activeTool } = useSelector((state) => {
    return {
      activeStep: state.step,
      activeTool: state.tool,
    };
  });
  const dispatch = useDispatch();
  const gotoPreviousStep = async (step: Step) => {
    dispatch({ type: "GOTO_PREVIOUS_STEP", payload: step });
  };
  return { activeStep, gotoPreviousStep, activeTool };
};

const StepsNav: React.FC<BoxProps> = (props) => {
  const { activeStep, gotoPreviousStep, activeTool } = useStepsNav();
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <Steps
        width="100%"
        onStepChange={gotoPreviousStep}
        activeStep={activeStep}
        activeTool={activeTool}
      />
    </Box>
  );
};

export default StepsNav;
