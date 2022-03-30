import React from "react";
import { useSelector, useDispatch, TOOL } from "./AccessibleForm";
import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Create from "@mui/icons-material/Create";
import Delete from "@mui/icons-material/Delete";
import SelectAll from "@mui/icons-material/SelectAll";

interface ToolButtonProps {
  toolName: TOOL;
  activeTool: string;
  Icon: React.FC;
}

const ToolButton: React.FC<ToolButtonProps> = (props) => {
  const { toolName, activeTool, Icon } = props;
  const dispatch = useDispatch();
  return (
    <Button
      onClick={() => dispatch({ type: "CHANGE_TOOL", payload: toolName })}
      sx={{ marginBottom: "16px" }}
      variant={toolName === activeTool ? "contained" : "outlined"}>
      <Icon />
    </Button>
  );
};

const ToolSelect: React.FC<BoxProps> = (props) => {
  const activeTool = useSelector((state) => state.tool);
  return (
    <Box display="flex" flexDirection="column" alignItems="center" {...props}>
      <Typography sx={{ marginBottom: "16px" }} fontWeight="bold" variant="h4">
        Tools
      </Typography>
      <ToolButton activeTool={activeTool} toolName="CREATE" Icon={Create} />
      <ToolButton activeTool={activeTool} toolName="SELECT" Icon={SelectAll} />
    </Box>
  );
};

export default ToolSelect;
