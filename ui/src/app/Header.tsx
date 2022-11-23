/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useSelector, useDispatch, Step, STEPS } from "./StoreProvider";
import color from "../components/color";
import { useHotkeys } from "react-hotkeys-hook";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import Fab from "@mui/material/Fab";
import ClearIcon from "@mui/icons-material/Clear";
import { FloatingDiv } from "./Zoom";

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
  const isLastStep = step === "LABEL_LAYER";

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

  const currentSectionHeight = sections[currentSection].y - prevSectionY;

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

const Header: React.FC<BoxProps> = (props) => {
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

const FormSelect: React.FC = () => {
  // we cannot use useState here as we are reloading the page and clearing state
  // and all information will be lost this way.
  const currentForm =
    window.location.hash === "" ? "1" : window.location.hash.substring(1);
  return (
    <Box position="fixed" left="24px" top="24px" zIndex={110}>
      <FormControl size="small">
        <Select
          value={currentForm}
          onChange={(e) => {
            window.location.href =
              window.location.origin + "#" + e.target.value;
            // we clear the current state present in local storage, when page is reloaded new state is loaded automatically from the URL.
            window.localStorage.clear();
            window.location.reload();
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const ExitButtonForCreateTool: React.FC = () => {
  const [step, tool] = useSelector((state) => [state.step, state.tool]);
  const dispatch = useDispatch();
  const showCancelButton = step === "LABEL_LAYER" && tool === "CREATE";
  // TODO : We need to think about how to handle GROPU_LAYER here as when
  // user moves CREATE tool a gropu is already created so we need to undo that as well.
  // (step === "LABEL_LAYER" || step === "GROUP_LAYER") && tool === "CREATE";
  return (
    <>
      {showCancelButton && (
        <Fab
          sx={{
            position: "absolute",
            top: "8rem",
            left: "50%",
          }}
          size="medium"
          color="primary"
          aria-label="cancel"
          onClick={() => {
            dispatch({ type: "CHANGE_TOOL", payload: "SELECT" });
          }}>
          <ClearIcon />
        </Fab>
      )}
    </>
  );
};

const PreviewTooltipCheckbox: React.FC = () => {
  const [step, tool, previewTooltips] = useSelector((state) => [
    state.step,
    state.tool,
    state.previewTooltips,
  ]);
  const dispatch = useDispatch();
  const handlePrevewTooltipsChange = () => {
    dispatch({ type: "TOGGLE_PREVIEW_TOOLTIPS" });
  };
  const showPreviewTooltipCheckbox =
    step === "LABEL_LAYER" && tool === "SELECT";
  return (
    <>
      {showPreviewTooltipCheckbox && (
        <FloatingDiv
          position={{
            right: 24,
            top: 144,
          }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={previewTooltips}
                onChange={handlePrevewTooltipsChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="Preview Tooltips"
          />
        </FloatingDiv>
      )}
    </>
  );
};

export { Header, ExitButtonForCreateTool, FormSelect, PreviewTooltipCheckbox };
