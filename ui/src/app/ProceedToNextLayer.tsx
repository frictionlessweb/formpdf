import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import color from "../components/color";
import { useDispatch, useSelector } from "./StoreProvider";

const ProceedToNextLayer: React.FC = () => {
  const dispatch = useDispatch();

  const { pages, width, height, annotations, step } = useSelector((state) => {
    return {
      step: state.step,
      pages: state.tokens.length,
      width: state.width,
      height: state.height,
      annotations: state.annotations,
    };
  });

  const sendToApi = {
    pages,
    width,
    height,
    annotations,
  };
  const isLastStep = step === "GROUP_LAYER";

  return (
    <Box
      position="fixed"
      bottom="24px"
      display="flex"
      zIndex={10}
      flexDirection="column"
      paddingTop="20px">
      <Button
        sx={{
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: "800",
          paddingLeft: "48px",
          paddingRight: "48px",
          backgroundColor: color.blue.medium,
          border: "2px solid white",
          boxShadow: 6,
        }}
        onClick={async () => {
          switch (step) {
            case "SECTION_LAYER": {
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
              return;
            }
            // Fallthrough intentionally, equivalent to an or
            // eslint-disable-next-line
            case "FIELD_LAYER":
            case "LABEL_LAYER": {
              dispatch({ type: "GOTO_NEXT_STEP" });
              return;
            }
            case "GROUP_LAYER": {
              dispatch({
                type: "CREATE_NEW_SECTION",
              });
            }
          }
        }}
        variant="contained">
        {isLastStep ? "Proceed to Next Section" : "Proceed to Next Layer"}
      </Button>
    </Box>
  );
};
export default ProceedToNextLayer;
