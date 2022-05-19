import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useDispatch, useSelector } from "./StoreProvider";

const ProceedToNextLayer: React.FC = () => {
  const dispatch = useDispatch();
  const { step, ...sendToApi } = useSelector((state) => {
    return {
      step: state.step,
      pages: state.tokens.length,
      width: state.width,
      height: state.height,
      annotations: state.annotations,
    };
  });
  const isLastStep = step === "GROUP_LAYER";

  const getRandomlyGeneratedAnnotation = async () => {
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
    const { annotations } = await res.json();
    dispatch({
      type: "INCREMENT_STEP_AND_ANNOTATIONS",
      payload: {
        annotations,
      },
    });
  };

  const goToNextSection = () => {
    console.log("here");
    dispatch({
      type: "CREATE_NEW_SECTION",
    });
  };

  return (
    <Box
      position="absolute"
      display="flex"
      flexDirection="column"
      top={660}
      zIndex={1000}>
      <Button
        onClick={isLastStep ? goToNextSection : getRandomlyGeneratedAnnotation}
        variant="contained">
        {isLastStep ? "Proceed to Next Section" : "Proceed to Next Layer"}
      </Button>
    </Box>
  );
};
export default ProceedToNextLayer;
