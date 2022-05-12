import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useDispatch } from "./StoreProvider";

const ProceedToNextLayer: React.FC = () => {
  const dispatch = useDispatch();
  return (
    <Box
      position="absolute"
      display="flex"
      flexDirection="column"
      top={660}
      zIndex={1000}>
      <Button
        onClick={() => dispatch({ type: "GOTO_NEXT_STEP" })}
        variant="contained">
        Proceed to Next Layer
      </Button>
    </Box>
  );
};
export default ProceedToNextLayer;
