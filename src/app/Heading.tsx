/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Panel from "../components/Panel";

const Heading: React.FC<BoxProps> = (props) => {
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <Typography variant="h3" color="orange" width="128px">
        A11y
      </Typography>
      <Steps width="100%" maxWidth="800px" paddingY="1em" activeStep={0} />
      <Panel />
      <div css={{ width: "128px" }} />
    </Box>
  );
};

export default Heading;
