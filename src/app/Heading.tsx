/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Panel from "../components/Panel";
import { useSelector } from "./AccessibleForm";

const Heading: React.FC<BoxProps> = (props) => {
  const activeStep = useSelector((state) => state.step);
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <div css={{ width: "10%" }}>
        <img src="/logo.svg" alt="logo of FormA11y" />
      </div>
      <Steps width="80%" activeStep={activeStep} />
      <Panel width="10%" />
    </Box>
  );
};

export default Heading;
