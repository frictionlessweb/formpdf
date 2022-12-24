import React from "react";
import { useSelector, useDispatch, TOOL } from "./StoreProvider";
import Box, { BoxProps } from "@mui/material/Box";
import { IconButton, Tooltip } from "@mui/material";
import color from "../components/color";
import NearMeIcon from "@mui/icons-material/NearMe";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import DownloadIcon from "@mui/icons-material/Download";
import { LOCAL_STORAGE_KEY } from "./utils";
import { getCurrentFormNumber } from "./Header";

const CursorIcon = () => <NearMeIcon sx={{ transform: "scale(-0.8, 0.8)" }} />;

interface ToolButtonProps {
  toolName: TOOL;
  activeTool: string;
  children: React.ReactNode;
  tooltip: string;
}

const ToolButton: React.FC<ToolButtonProps> = (props) => {
  const { toolName, activeTool, tooltip, children } = props;
  const dispatch = useDispatch();
  const isActive = toolName === activeTool;
  return (
    <Tooltip title={tooltip} placement="right">
      <IconButton
        onClick={() => dispatch({ type: "CHANGE_TOOL", payload: toolName })}
        sx={{
          backgroundColor: isActive ? color.blue.medium : color.white.medium,
          width: "34px",
          height: "34px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: isActive ? color.blue.medium : color.gray.line,
          },
          color: isActive ? color.white.medium : color.gray.dark,
          marginBottom: "8px",
        }}>
        {children}
      </IconButton>
    </Tooltip>
  );
};

const DownloadState = () => {
  const handleClick = () => {
    const fileName = "form_" + getCurrentFormNumber() + ".json";
    const state: string = window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "";
    const data = new Blob([state], { type: "text/json" });
    const jsonURL = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = jsonURL;
    link.setAttribute("download", fileName);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: "16px",
      }}>
      <Tooltip title={"Save File to Computer"} placement="right">
        <IconButton
          onClick={handleClick}
          sx={{
            width: "34px",
            height: "34px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: color.gray.line,
            },
            color: color.gray.dark,
          }}>
          <DownloadIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const ToolSelect: React.FC<BoxProps> = (props) => {
  const activeTool = useSelector((state) => state.tool);
  const activeStep = useSelector((state) => state.step);
  let tools = <></>;
  switch (activeStep) {
    case "FIELD_LAYER": {
      tools = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
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
        </div>
      );
      break;
    }
    default: {
      tools = (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <ToolButton
            activeTool={activeTool}
            toolName="SELECT"
            tooltip="Select">
            <CursorIcon />
          </ToolButton>
        </div>
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
        alignItems: "center",
        justifyContent: "space-between",
      }}>
      {tools}
      <DownloadState />
    </Box>
  );
};

export default ToolSelect;
