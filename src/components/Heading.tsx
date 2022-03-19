import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Heading: React.FC<BoxProps> = (props) => {
  return (
    <Box
      display="flex"
      position="relative"
      justifyContent="center"
      width="100%"
      {...props}>
      <Typography variant="h3" color="orange" position="absolute" left="0">
        A11y
      </Typography>
      <Steps width="100%" maxWidth="800px" paddingY="1em" activeStep={0} />
    </Box>
  );
};

export default Heading;
