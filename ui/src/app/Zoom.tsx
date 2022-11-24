/** @jsxImportSource @emotion/react */
import React from "react";
import Box from "@mui/material/Box";
import color from "../components/color";
import { useSelector, useDispatch } from "./StoreProvider";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useHotkeys } from "react-hotkeys-hook";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;

// floating point arithmetic created zoom level such as 0.70000000000001, so we
// started using predefined values.
const ZOOM_LEVELS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

interface ZoomProps {}

const Zoom: React.FC<ZoomProps> = () => {
  const zoom = useSelector((state) => state.zoom);
  const dispatch = useDispatch();

  const onIncrease = () => {
    if (zoom >= MAX_ZOOM) return;
    const currentZoomIdx = ZOOM_LEVELS.findIndex((z) => z === zoom);
    dispatch({
      type: "CHANGE_ZOOM",
      payload: ZOOM_LEVELS[currentZoomIdx + 1],
    });
  };

  const onDecrease = () => {
    if (zoom <= MIN_ZOOM) return;
    const currentZoomIdx = ZOOM_LEVELS.findIndex((z) => z === zoom);
    dispatch({
      type: "CHANGE_ZOOM",
      payload: ZOOM_LEVELS[currentZoomIdx - 1],
    });
  };

  useHotkeys("i", onDecrease, [zoom]);
  useHotkeys("o", onIncrease, [zoom]);

  return (
    <FloatingDiv
      position={{
        right: 24,
        bottom: 24,
      }}>
      <Tooltip title={"Zoom Out (O)"} placement="top">
        <IconButton
          sx={{
            "&:hover": {
              color: color.blue.medium,
              backgroundColor: color.blue.transparent,
              borderRadius: "12px",
            },
            color: color.black.medium,
          }}
          disabled={zoom <= MIN_ZOOM}
          onClick={onDecrease}>
          <RemoveIcon />
        </IconButton>
      </Tooltip>

      <span style={{ fontWeight: "bold", paddingLeft: 8, paddingRight: 8 }}>
        {Math.floor(zoom * 100)}%
      </span>
      <Tooltip title={"Zoom In (I)"} placement="top">
        <IconButton
          sx={{
            "&:hover": {
              color: color.blue.medium,
              backgroundColor: color.blue.transparent,
              borderRadius: "12px",
            },
            color: color.black.medium,
          }}
          disabled={zoom >= MAX_ZOOM}
          onClick={onIncrease}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    </FloatingDiv>
  );
};

const FloatingDiv: React.FC<{
  children?: React.ReactNode;
  position: React.CSSProperties;
}> = (props) => {
  const { children, position } = props;
  return (
    <Box
      sx={{
        position: "fixed",
        ...position,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
        zIndex: 500,
        borderRadius: "8px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}>
      {children}
    </Box>
  );
};

export { FloatingDiv, Zoom };
