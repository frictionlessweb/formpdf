/** @jsxImportSource @emotion/react */
import React from "react";
import Box from "@mui/material/Box";
import color from "../components/color";
import { useSelector, useDispatch } from "./StoreProvider";
import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

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
        width: 160,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        zIndex: 10,
        borderRadius: "8px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}>
      <RemoveOutlinedIcon
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
        }}
        onClick={onIncrease}
      />
      <span style={{ fontWeight: "bold" }}>{Math.floor(zoom * 100)}%</span>
      <AddOutlinedIcon
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
        }}
        onClick={onDecrease}
      />
    </Box>
  );
};

export default Zoom;
