import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import color from "../components/color";
import { useDispatch, useSelector, Annotation } from "./StoreProvider";
import allPagesPredictions from "./predictions.json";
import { Dispatch } from "redux";

const GET_ANNOTATIONS_FROM_SERVER = false;

interface sendToApi {
  pages: number;
  annotations: Record<string, Annotation>;
  width: number;
  height: number;
}

const ProceedToNextLayer: React.FC = () => {
  const dispatch = useDispatch();

  const { step, pages, pdfWidth, pdfHeight, annotations } = useSelector(
    (state) => {
      return {
        step: state.step,
        pages: state.tokens.length,
        pdfWidth: state.pdfWidth,
        pdfHeight: state.pdfHeight,
        annotations: state.annotations,
      };
    }
  );

  const sendToApi = {
    pages,
    width: pdfWidth,
    height: pdfHeight,
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
              if (GET_ANNOTATIONS_FROM_SERVER) {
                await getAnnotationsFromServer(dispatch, sendToApi);
              } else {
                getAnnotationsFromFile(dispatch, pdfHeight);
              }
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

const getAnnotationsFromServer = async (
  dispatch: Dispatch,
  sendToApi: sendToApi
) => {
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
};

const getAnnotationsFromFile = (dispatch: Dispatch, pdfHeight: number) => {
  const annotations = allPagesPredictions.map((pagePredictions, pageNumber) => {
    return pagePredictions.map((annotation) => {
      const { left, width, top, height } = annotation;
      return {
        id: window.crypto.randomUUID(),
        type: "TEXTBOX",
        left,
        width,
        top: top + pdfHeight * pageNumber,
        height,
      };
    });
  });
  dispatch({
    type: "INCREMENT_STEP_AND_ANNOTATIONS",
    payload: {
      annotations,
      groupRelations: {},
      labelRelations: {},
    },
  });
};

export default ProceedToNextLayer;
