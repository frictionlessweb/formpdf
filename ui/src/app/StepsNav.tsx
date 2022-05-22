/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import { useSelector, useDispatch, Step } from "./StoreProvider";

const useStepsNav = () => {
  const { activeStep } = useSelector((state) => {
    return {
      activeStep: state.step,
      width: state.width,
      height: state.height,
      pages: state.tokens.length,
    };
  });
  const dispatch = useDispatch();
  const gotoPreviousStep = async (step: Step) => {
    dispatch({ type: "GOTO_PREVIOUS_STEP", payload: step });
  };
  return { activeStep, gotoPreviousStep };
};

const StepsNav: React.FC<BoxProps> = (props) => {
  const { activeStep, gotoPreviousStep } = useStepsNav();
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <Steps
        width="100%"
        onStepChange={gotoPreviousStep}
        activeStep={activeStep}
      />
    </Box>
  );
};

export default StepsNav;
