import React from "react";
import {
  useSelector,
  useDispatch,
  TOOL,
  DEFAULT_ACCESSIBLE_FORM,
} from "./AccessibleForm";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import RestartAlt from "@mui/icons-material/RestartAlt";

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

/** TODO: Once we stabalize the data model, getting rid of this button
 * probably makes sense. Until then, we'll include it to help unblock
 * people who want to try the app and get stuck
 */

const ResetButton = () => {
  const dispatch = useDispatch();
  return (
    <Button
      variant="contained"
      onClick={() =>
        dispatch({ type: "HYDRATE_STORE", payload: DEFAULT_ACCESSIBLE_FORM })
      }>
      <RestartAlt />
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
      <ResetButton />
    </Box>
  );
};

export default ToolSelect;
