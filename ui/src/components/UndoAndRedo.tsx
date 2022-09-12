import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import color from "../components/color";
import { IconButton } from "@mui/material";
import { useDispatch, useSelector } from "../app/StoreProvider";

const UndoAndRedo: React.FC<BoxProps> = (props) => {
  const dispatch = useDispatch();
  const [canRedo, canUndo] = useSelector((state) => [
    state.canRedo,
    state.canUndo,
  ]);

  const onUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const onRedo = () => {
    dispatch({ type: "REDO" });
  };

  return (
    <Box
      sx={{
        position: "fixed",
        left: 24,
        bottom: 24,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
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
        onClick={onUndo}
        disabled={!canUndo}>
        <UndoIcon />
      </IconButton>
      <IconButton
        sx={{
          "&:hover": {
            color: color.blue.medium,
            backgroundColor: color.blue.transparent,
            borderRadius: "12px",
          },
          color: color.black,
        }}
        onClick={onRedo}
        disabled={!canRedo}>
        <RedoIcon />
      </IconButton>
    </Box>
  );
};

export default UndoAndRedo;
