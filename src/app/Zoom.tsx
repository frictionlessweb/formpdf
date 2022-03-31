/** @jsxImportSource @emotion/react */
import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useSelector, useDispatch } from "./AccessibleForm";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

interface ZoomProps {}

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
            payload: value / 100,
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
