/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Panel from "../components/Panel";

const Heading: React.FC<BoxProps> = (props) => {
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <div css={{ width: "10%" }}>
        <img src="/logo.svg" alt="logo of FormA11y" />
      </div>
      <Steps width="80%" activeStep={2} />
      <Panel width="10%" />
    </Box>
  );
};

export default Heading;
