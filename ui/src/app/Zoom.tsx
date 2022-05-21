/** @jsxImportSource @emotion/react */
import React from "react";
import Box from "@mui/material/Box";
import color from "../components/color";
import { useSelector, useDispatch } from "./StoreProvider";
import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;

interface ZoomProps {}

const Zoom: React.FC<ZoomProps> = () => {
  const zoom = useSelector((state) => state.zoom);
  const dispatch = useDispatch();

  const onIncrease = () => {
    const newZoom = zoom + 0.1;
    dispatch({
      type: "CHANGE_ZOOM",
      payload: newZoom,
    });
  };

  const onDecrease = () => {
    const newZoom = zoom - 0.1;
    dispatch({
      type: "CHANGE_ZOOM",
      payload: newZoom,
    });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 24,
        bottom: 24,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
        zIndex: 10,
        borderRadius: "8px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}>
      <IconButton
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
          color: color.black,
        }}
        disabled={zoom <= MIN_ZOOM}
        onClick={onDecrease}>
        <RemoveIcon />
      </IconButton>
      <span style={{ fontWeight: "bold", paddingLeft: 8, paddingRight: 8 }}>
        {Math.floor(zoom * 100)}%
      </span>
      <IconButton
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
          color: color.black,
        }}
        disabled={zoom >= MAX_ZOOM}
        onClick={onIncrease}>
        <AddIcon />
      </IconButton>
    </Box>
  );
};

export default Zoom;
