/** @jsxImportSource @emotion/react */
import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useSelector, useDispatch } from "./AccessibleForm";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

interface ZoomProps {}

// We keep the Zoom at a multiple of 0.5 - 1.5 internally, but
// the UI shows 50 - 150%. Rather than worry about problems with
// floating point math, we just store all possible values in a
// dict.
const ZOOM_VALUE_MAP = {
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  100: 1,
  110: 1.1,
  120: 1.2,
  130: 1.3,
  140: 1.4,
  150: 1.5,
};

const Zoom: React.FC<ZoomProps> = () => {
  const zoom = useSelector((state) => state.zoom);
  const dispatch = useDispatch();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "16px",
        width: ["20%", "30%"],
      }}>
      <ZoomOutIcon sx={{ marginRight: "1rem" }} />
      <Slider
        onChange={(_, value) => {
          if (Array.isArray(value)) {
            throw new Error(`Non numeric zoom ${value}`);
          }
          dispatch({
            type: "CHANGE_ZOOM",
            // Floating point math...
            payload: ZOOM_VALUE_MAP[value as keyof typeof ZOOM_VALUE_MAP],
          });
        }}
        aria-label="Temperature"
        value={Math.floor(zoom * 100)}
        valueLabelDisplay="auto"
        step={10}
        marks
        min={50}
        max={150}
      />
      <ZoomInIcon sx={{ marginLeft: "1rem" }} />
    </Box>
  );
};

export default Zoom;
