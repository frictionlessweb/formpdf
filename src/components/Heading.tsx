import React from "react";
import Steps from "./Steps";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface HeadingProps {}

const Heading: React.FC<HeadingProps> = () => {
  return (
    <Box display="flex" position="relative" justifyContent="center">
      <Typography variant="h3" color="orange" position="absolute" left="0">
        A11y
      </Typography>
      <Steps width="100%" maxWidth="800px" paddingY="1em" activeStep={0} />
    </Box>
  );
};

export default Heading;
