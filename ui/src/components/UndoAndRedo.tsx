import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import color from "../components/color";
import { IconButton, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "../app/StoreProvider";
import { useHotkeys } from "react-hotkeys-hook";

const UndoAndRedo: React.FC<BoxProps> = (props) => {
  const dispatch = useDispatch();

  const canRedo = useSelector((state) => state.canRedo);
  const canUndo = useSelector((state) => state.canUndo);
  const currentVersion = useSelector((state) => state.currentVersion);

  const onUndo = () => {
    if (canUndo) {
      dispatch({ type: "UNDO" });
    }
  };

  const onRedo = () => {
    if (canRedo) {
      dispatch({ type: "REDO" });
    }
  };

  // the third argument is the dependencies array, which is an array of values that
  // the effect depends on. If any of these values change, the effect will be re-run.
  // Without dependency array, the onUndo and onRedo were getting memoized and
  // the hotkeys were not working as they had stale references of canUndo and canRedo.
  useHotkeys("u", onUndo, [currentVersion]);
  useHotkeys("r", onRedo, [currentVersion]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
      }}>
      <Tooltip title={"Undo (U)"} placement="right">
        {/* Span around IconButton is a workaround for https://mui.com/material-ui/react-tooltip/#disabled-elements */}
        <span>
          <IconButton
            sx={{
              "&:hover": {
                color: color.blue.medium,
                backgroundColor: color.blue.transparent,
                borderRadius: "12px",
              },
              color: color.black.medium,
            }}
            onClick={onUndo}
            disabled={!canUndo}>
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={"Redo (R)"} placement="right">
        <span>
          <IconButton
            sx={{
              "&:hover": {
                color: color.blue.medium,
                backgroundColor: color.blue.transparent,
                borderRadius: "12px",
              },
              color: color.black.medium,
            }}
            onClick={onRedo}
            disabled={!canRedo}>
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default UndoAndRedo;
