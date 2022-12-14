import React from "react";
import {
  useSelector,
  useDispatch,
  TOOL,
  DEFAULT_ACCESSIBLE_FORM,
} from "./StoreProvider";
import Box, { BoxProps } from "@mui/material/Box";
import { IconButton, Tooltip } from "@mui/material";
import color from "../components/color";
import NearMeIcon from "@mui/icons-material/NearMe";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

const CursorIcon = () => <NearMeIcon sx={{ transform: "scaleX(-1)" }} />;

interface ToolButtonProps {
  toolName: TOOL;
  activeTool: string;
  children: React.ReactNode;
  tooltip: string;
}

const ToolButton: React.FC<ToolButtonProps> = (props) => {
  const { toolName, activeTool, tooltip, children } = props;
  const dispatch = useDispatch();
  const isActiveColor =
    toolName === activeTool ? color.blue.medium : color.black.medium;
  return (
    <Tooltip title={tooltip} placement="right">
      <IconButton
        onClick={() => dispatch({ type: "CHANGE_TOOL", payload: toolName })}
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
          color: isActiveColor,
          marginBottom: "8px",
        }}>
        {children}
      </IconButton>
    </Tooltip>
  );
};

/**
 * TODO: Once we stabalize the data model, getting rid of this button
 * probably makes sense. Until then, we'll include it to help unblock
 * people who want to try the app and get stuck
 */
const ResetButton = () => {
  const dispatch = useDispatch();
  return (
    <IconButton
      onClick={() => {
        // We also clear localStorage as store is saved into it.
        window.localStorage.clear();
        dispatch({ type: "HYDRATE_STORE", payload: DEFAULT_ACCESSIBLE_FORM });
      }}
      sx={{
        "&:hover": {
          color: color.red.medium,
          backgroundColor: color.red.transparent,
          borderRadius: "12px",
        },
        color: color.red.medium,
      }}>
      <PlaylistRemoveIcon />
    </IconButton>
  );
};

const ToolSelect: React.FC<BoxProps> = (props) => {
  const activeTool = useSelector((state) => state.tool);
  const activeStep = useSelector((state) => state.step);
  let tools = <></>;
  switch (activeStep) {
    case "FIELD_LAYER": {
      tools = (
        <>
          <ToolButton
            activeTool={activeTool}
            toolName="SELECT"
            tooltip="Select (S)">
            <CursorIcon />
          </ToolButton>
          <ToolButton
            activeTool={activeTool}
            toolName="CREATE"
            tooltip="Create (C)">
            <FormatShapesIcon />
          </ToolButton>
          <ResetButton />
        </>
      );
      break;
    }
    default: {
      tools = (
        <>
          <ToolButton
            activeTool={activeTool}
            toolName="SELECT"
            tooltip="Select">
            <CursorIcon />
          </ToolButton>
          <ResetButton />
        </>
      );
      break;
    }
  }
  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        height: "100vh",
        backgroundColor: color.gray.light,
        borderRight: `1px solid ${color.gray.line}`,
        width: "64px",
        paddingTop: "88px",
        display: "flex",
        flexDirection: "column",
      }}>
      {tools}
    </Box>
  );
};

export default ToolSelect;
