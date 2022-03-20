import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

const Steps: React.FC<BoxProps & { activeStep: number }> = (props) => {
  const { activeStep, ...boxProps } = props;
  return (
    <Box {...boxProps}>
      <Stepper activeStep={activeStep}>
        <Step>
          <StepLabel>Section</StepLabel>
        </Step>
        <Step>
          <StepLabel>Fields</StepLabel>
        </Step>
        <Step>
          <StepLabel>Labels</StepLabel>
        </Step>
        <Step>
          <StepLabel>Groups</StepLabel>
        </Step>
        <Step>
          <StepLabel>Tooltips</StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
};

export default Steps;
