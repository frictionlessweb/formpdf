/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Panel from "../components/Panel";
import { useSelector, useDispatch, Step, ApiAnnotation } from "./StoreProvider";

const useHeading = () => {
  const { activeStep, width, height, pages } = useSelector((state) => {
    return {
      activeStep: state.step,
      width: state.width,
      height: state.height,
      pages: state.tokens.length,
    };
  });
  const dispatch = useDispatch();
  const fetchNewAnnotations = async (step: Step) => {
    dispatch({ type: "SHOW_LOADING_SCREEN" });
    const res = await window.fetch("/api/annotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pages, width, height }),
    });
    const { annotations } = await res.json();
    dispatch({
      type: "CHANGE_STEP_AND_ANNOTATIONS",
      payload: {
        step,
        annotations,
      },
    });
  };
  return {
    activeStep,
    fetchNewAnnotations,
  };
};

const Heading: React.FC<BoxProps> = (props) => {
  const { activeStep, fetchNewAnnotations } = useHeading();
  return (
    <Box display="flex" justifyContent="space-between" width="100%" {...props}>
      <div css={{ width: "10%" }}>
        <img src="/logo.svg" alt="logo of FormA11y" />
      </div>
      <Steps
        width="80%"
        onStepChange={fetchNewAnnotations}
        activeStep={activeStep}
      />
      <Panel width="10%" />
    </Box>
  );
};

export default Heading;
