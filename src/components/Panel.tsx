import React from "react";
import { Button, ButtonGroup } from "@mui/material";
import { useDispatch, useSelector } from "../app/AccessibleForm";

const Panel: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const [canRedo, canUndo] = useSelector((state) => [
    state.canRedo,
    state.canUndo,
  ]);
  return (
    <ButtonGroup variant="outlined" aria-label="outlined button group">
      <Button onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo}>
        Redo
      </Button>
      <Button onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo}>
        Undo
      </Button>
    </ButtonGroup>
  );
};

export default Panel;
