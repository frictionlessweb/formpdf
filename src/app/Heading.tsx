/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Panel from "../components/Panel";
import { useSelector, useDispatch } from "./StoreProvider";

const Heading: React.FC<BoxProps> = (props) => {
  const activeStep = useSelector((state) => state.step);
  const dispatch = useDispatch();
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <div css={{ width: "10%" }}>
        <img src="/logo.svg" alt="logo of FormA11y" />
      </div>
      <Steps
        width="80%"
        onStepChange={(step) => {
          dispatch({
            type: "SET_STEP",
            payload: step,
          });
        }}
        activeStep={activeStep}
      />
      <Panel width="10%" />
    </Box>
  );
};

export default Heading;
