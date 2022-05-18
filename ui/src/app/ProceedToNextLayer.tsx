import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "./StoreProvider";

const ProceedToNextLayer: React.FC = () => {
  const dispatch = useDispatch();
  const { pages, width, height, annotations, step } = useSelector((state) => {
    return {
      pages: state.tokens.length,
      width: state.width,
      height: state.height,
      annotations: state.annotations,
      step: state.step,
    };
  });
  const sendToApi = {
    pages,
    width,
    height,
    annotations,
  };
  return (
    <Box
      position="absolute"
      display="flex"
      flexDirection="column"
      top={660}
      zIndex={1000}>
      <Button
        onClick={async () => {
          if (step !== "SECTION_LAYER") {
            dispatch({ type: "GOTO_NEXT_STEP" });
            return;
          }
          dispatch({ type: "SHOW_LOADING_SCREEN" });
          const res = await window.fetch(
            `${process.env.REACT_APP_API_PATH || ""}/annotations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(sendToApi),
            }
          );
          const jsonRes = await res.json();
          const { annotations, groupRelations, labelRelations } = jsonRes;
          dispatch({
            type: "INCREMENT_STEP_AND_ANNOTATIONS",
            payload: {
              annotations,
              groupRelations,
              labelRelations,
            },
          });
        }}
        variant="contained">
        Proceed to Next Layer
      </Button>
    </Box>
  );
};
export default ProceedToNextLayer;
