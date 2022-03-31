import React from "react";
import { useSelector, useDispatch, TOOL } from "./AccessibleForm";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";

interface ToolButtonProps {
  toolName: TOOL;
  activeTool: string;
  src: string;
  alt: string;
}

const ToolButton: React.FC<ToolButtonProps> = (props) => {
  const { toolName, activeTool, src, alt } = props;
  const dispatch = useDispatch();
  return (
    <Button
      onClick={() => dispatch({ type: "CHANGE_TOOL", payload: toolName })}
      sx={{ marginBottom: "16px" }}
      variant={toolName === activeTool ? "contained" : "outlined"}>
      <img src={src} alt={alt} />
    </Button>
  );
};

const ToolSelect: React.FC<BoxProps> = (props) => {
  const activeTool = useSelector((state) => state.tool);
  return (
    <Box display="flex" flexDirection="column" alignItems="center" {...props}>
      <ToolButton
        activeTool={activeTool}
        toolName="SELECT"
        src="./cursorIcon.svg"
        alt="cursor icon"
      />
      <ToolButton
        activeTool={activeTool}
        toolName="CREATE"
        src="./fieldIcon.svg"
        alt="field icon"
      />
    </Box>
  );
};

export default ToolSelect;
