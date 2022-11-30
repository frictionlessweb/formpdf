/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useSelector, useDispatch, Step, STEPS } from "./StoreProvider";
import color from "../components/color";
import { useHotkeys } from "react-hotkeys-hook";
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FormControl } from "@mui/material";
import Fab from "@mui/material/Fab";
import ClearIcon from "@mui/icons-material/Clear";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

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
  const step = useSelector((state) => state.step);
  const currentSection = useSelector((state) => state.currentSection);

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

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  marginBottom: "0.4rem",
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: color.gray.line,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: color.green.medium,
  },
}));

const Progress = () => {
  const sections = useSelector((state) => state.sections);
  const currentSection = useSelector((state) => state.currentSection);
  const currentStep = useSelector((state) => state.step);
  const pdfHeight = useSelector((state) => state.pdfHeight);
  const numPages = useSelector((state) => state.tokens.length);

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
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "0.2rem",
        }}>
        <span>Progress</span>
        <span>{Math.round(progressValue)}%</span>
      </div>
      <div>
        <BorderLinearProgress variant="determinate" value={progressValue} />
      </div>
      <div
        style={{
          color: color.black.medium,
          fontSize: "0.75rem",
        }}>
        You are working in section {currentSection + 1}
      </div>
    </>
  );
};

const Header: React.FC = () => {
  const activeStep = useSelector((state) => state.step);
  const activeTool = useSelector((state) => state.tool);
  const dispatch = useDispatch();
  const goToStep = async (step: Step) => {
    dispatch({ type: "GOTO_STEP", payload: step });
  };
  const stepIndex = STEPS.findIndex((step) => step.id === activeStep);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: color.white.medium,
        borderBottom: `0.5px solid ${color.gray.line}`,
        zIndex: 100,
      }}>
      <div
        css={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          borderBottom: `0.5px solid ${color.gray.line}`,
          paddingTop: "1rem",
          paddingBottom: "1rem",
        }}>
        <PrevStepButton />
        <Steps onStepChange={goToStep} stepIndex={stepIndex} />
        <NextStepButton />
        {/* <div
          style={{
            width: "15rem",
            position: "absolute",
            right: "2rem",
            top: "1.2rem",
          }}>
          <Progress />
        </div> */}
      </div>

      <div
        css={{
          textAlign: "center",
          width: "100%",
          padding: "0.4rem 0 0.4rem 0",
          fontWeight: "medium",
          backgroundColor: color.gray.medium,
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
  const step = useSelector((state) => state.step);
  const tool = useSelector((state) => state.tool);
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

export { Header, ExitButtonForCreateTool, FormSelect };
