import React from "react";
import Box, { BoxProps } from "@mui/material/Box";
import { Button, ButtonGroup } from "@mui/material";
import { useDispatch, useSelector } from "../app/AccessibleForm";

const Panel: React.FC<BoxProps> = (props) => {
  const { ...boxProps } = props;
  const dispatch = useDispatch();
  const [canRedo, canUndo] = useSelector((state) => [
    state.canRedo,
    state.canUndo,
  ]);
  return (
    <Box {...boxProps}>
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Button onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>
          Redo
        </Button>
        <Button onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>
          Undo
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default Panel;
