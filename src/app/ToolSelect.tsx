import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LocationSearch from "@mui/icons-material/LocationSearching";
import AspectRatio from "@mui/icons-material/AspectRatio";
import Create from "@mui/icons-material/Create";

interface ToolSelectProps {}

const ToolSelect: React.FC<ToolSelectProps> = () => {
  return (
    <Box
      paddingX="24px"
      display="flex"
      flexDirection="column"
      position="absolute"
      alignItems="center"
      left="66%">
      <Typography sx={{ marginBottom: "16px" }} fontWeight="bold" variant="h4">
        Tools
      </Typography>
      <Button sx={{ marginBottom: "16px" }} variant="outlined">
        <Create />
      </Button>
      <Button sx={{ marginBottom: "16px" }} variant="contained">
        <LocationSearch />
      </Button>
      <Button variant="outlined">
        <AspectRatio />
      </Button>
    </Box>
  );
};

export default ToolSelect;
