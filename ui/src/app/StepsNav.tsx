/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useSelector, useDispatch, Step, STEPS } from "./StoreProvider";
import color from "../components/color";
import { useHotkeys } from "react-hotkeys-hook";
import LinearProgress from "@mui/material/LinearProgress";

const useStepsNav = () => {
  const { activeStep, activeTool } = useSelector((state) => {
    return {
      activeStep: state.step,
      activeTool: state.tool,
    };
  });
  const dispatch = useDispatch();
  const goToStep = async (step: Step) => {
    dispatch({ type: "GOTO_STEP", payload: step });
  };
  return { activeStep, goToStep, activeTool };
};

const NextStepButton: React.FC = () => {
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step);
  const isLastStep = step === "GROUP_LAYER";

  const onNext = () => {
    dispatch({ type: "GOTO_NEXT_STEP" });
  };

  useHotkeys("n", onNext, [step]);

  return (
    <Button
      sx={{
        borderRadius: "50px",
        textTransform: "none",
        fontWeight: "800",
        backgroundColor: color.blue.medium,
        zIndex: 100,
        width: "6.5rem",
      }}
      size="small"
      disableElevation
      onClick={onNext}
      variant="contained">
      {isLastStep ? "Next Section" : "Next Step"}
    </Button>
  );
};

const Progress = () => {
  const { sections, currentSection, currentStep, pdfHeight, numPages } =
    useSelector((state) => ({
      sections: state.sections,
      currentSection: state.currentSection,
      currentStep: state.step,
      pdfHeight: state.pdfHeight,
      numPages: state.tokens.length,
    }));
  const prevSectionY =
    currentSection === 0 ? 0 : sections[currentSection - 1].y;
  const totalHeight = pdfHeight * numPages;

  const currentSectionHeight =
    currentSection === 0
      ? sections[currentSection].y
      : sections[currentSection].y - sections[currentSection - 1].y;

  const currentStepIdx = STEPS.findIndex((aStep) => aStep.id === currentStep);

  const progressValue =
    (prevSectionY / totalHeight +
      (currentSectionHeight / totalHeight) *
        ((currentStepIdx + 1) / STEPS.length)) *
    100;
  return (
    <div
      style={{
        fontSize: "0.9rem",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}>
        <span>Progress</span>
        <span>{Math.round(progressValue)}%</span>
      </div>
      <div>
        <LinearProgress
          variant="determinate"
          color="success"
          sx={{
            backgroundColor: color.white.medium,
            marginTop: "0.3rem",
            marginBottom: "0.3rem",
          }}
          value={progressValue}
        />
      </div>
      <div
        style={{
          color: color.black.medium,
          opacity: 0.8,
        }}>
        You are working in section {currentSection + 1}
      </div>
    </div>
  );
};

const PrevStepButton: React.FC = () => {
  const dispatch = useDispatch();
  const [step, currentSection] = useSelector((state) => [
    state.step,
    state.currentSection,
  ]);
  const isFirstStep = step === "SECTION_LAYER";
  const isFirstSection = currentSection === 0;
  const onPrev = () => {
    dispatch({
      type: "GOTO_PREVIOUS_STEP",
    });
  };

  useHotkeys("p", onPrev, [step]);

  return (
    <Button
      sx={{
        borderRadius: "50px",
        textTransform: "none",
        fontWeight: "800",
        width: "6.5rem",
      }}
      size="small"
      disableElevation
      disabled={isFirstStep && isFirstSection}
      onClick={onPrev}
      variant="outlined">
      {isFirstStep ? "Prev Section" : "Prev Step"}
    </Button>
  );
};

const StepsNav: React.FC<BoxProps> = (props) => {
  const { activeStep, goToStep, activeTool } = useStepsNav();
  const stepIndex = STEPS.findIndex((step) => step.id === activeStep);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: color.gray.medium,
        borderBottom: `2px solid ${color.gray.line}`,
        zIndex: 100,
      }}>
      <div
        css={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          borderBottom: `2px solid ${color.gray.line}`,
          paddingTop: "1.5rem",
          paddingBottom: "1rem",
        }}>
        <PrevStepButton />
        <Steps onStepChange={goToStep} stepIndex={stepIndex} />
        <NextStepButton />
        <div
          style={{
            width: "15rem",
            position: "absolute",
            right: "2rem",
            top: "1.2rem",
          }}>
          <Progress />
        </div>
      </div>
      <div
        css={{
          textAlign: "center",
          fontSize: "0.8rem",
          width: "100%",
          paddingTop: "0.5rem",
          paddingBottom: "0.5rem",
          fontWeight: "medium",
          backgroundColor: color.gray.light,
        }}>
        {/* If a step has tool specific description then show that, if not, show default step description. */}
        {STEPS[stepIndex].toolDescription[activeTool] ??
          STEPS[stepIndex].description}
      </div>
    </Box>
  );
};

export default StepsNav;
