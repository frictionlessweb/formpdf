/** @jsxImportSource @emotion/react */
import React from "react";
import Steps from "./Steps";
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
import DividerIcon from "./assets/images/divider.svg";
import Box, { BoxProps } from "@mui/material/Box";
import { IconButton, Tooltip } from "@mui/material";
import RedoIcon from "./assets/images/redo.svg";
import UndoIcon from "./assets/images/undo.svg";
import ZoomInIcon from "./assets/images/zoom_in.svg";
import ZoomOutIcon from "./assets/images/zoom_out.svg";
import HelpIcon from "./assets/images/help.svg";

const Header: React.FC = () => {
  const activeStep = useSelector((state) => state.step);
  const dispatch = useDispatch();
  const goToStep = async (step: Step) => {
    dispatch({ type: "GOTO_STEP", payload: step });
  };
  const stepIndex = STEPS.findIndex((step) => step.id === activeStep);

  const StepsAndButtons = (
    <>
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
          gap: "24px",
        }}>
        <PrevStepButton />
        <Steps onStepChange={goToStep} stepIndex={stepIndex} />
        <NextStepButton />
      </div>
    </>
  );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: color.white.medium,
        borderBottom: `0.5px solid ${color.gray.line}`,
        zIndex: 100,
        padding: "0 24px 0 24px",
      }}>
      <LogoAndFormSelect />
      {StepsAndButtons}
      <HeaderTools />
    </Box>
  );
};

const Divider = () => {
  return <img src={DividerIcon} alt="" />;
};

// Left Side of Header

const LogoAndFormSelect: React.FC = () => {
  // we cannot use useState here as we are reloading the page and clearing state
  // and all information will be lost this way.
  const currentForm =
    window.location.hash === "" ? "1" : window.location.hash.substring(1);
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
      }}>
      <span
        style={{
          fontWeight: "700",
          paddingRight: "8px",
        }}>
        FormA11y
      </span>
      <Divider />
      <FormControl size="small">
        <Select
          sx={{
            ".MuiOutlinedInput-notchedOutline": {
              border: 0,
            },
            ".MuiSelect-select": {
              paddingLeft: "8px",
            },
            fontSize: "14px",
            color: color.gray.dark,
          }}
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
          <MenuItem value={1}>Form 1</MenuItem>
          <MenuItem value={2}>Form 2</MenuItem>
          <MenuItem value={3}>Form 3</MenuItem>
          <MenuItem value={4}>Form 4</MenuItem>
          <MenuItem value={5}>Form 5</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

// Middle of Header

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
        fontWeight: "600",
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
        border: `2px solid ${color.gray.dark}`,
        color: color.gray.dark,
        textTransform: "none",
        fontWeight: "600",
        width: "6.5rem",
        "&:hover": {
          border: `2px solid ${color.blue.medium}`,
          color: color.blue.medium,
        },
        "&:disabled": {
          border: "2px solid",
        },
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

// Helper Tools – Right side of header

const UndoAndRedo: React.FC<BoxProps> = (props) => {
  const dispatch = useDispatch();

  const canRedo = useSelector((state) => state.canRedo);
  const canUndo = useSelector((state) => state.canUndo);
  const currentVersion = useSelector((state) => state.currentVersion);

  const onUndo = () => {
    if (canUndo) {
      dispatch({ type: "UNDO" });
    }
  };

  const onRedo = () => {
    if (canRedo) {
      dispatch({ type: "REDO" });
    }
  };

  // the third argument is the dependencies array, which is an array of values that
  // the effect depends on. If any of these values change, the effect will be re-run.
  // Without dependency array, the onUndo and onRedo were getting memoized and
  // the hotkeys were not working as they had stale references of canUndo and canRedo.
  useHotkeys("u", onUndo, [currentVersion]);
  useHotkeys("r", onRedo, [currentVersion]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "8px",
      }}>
      <Tooltip title={"Undo (U)"} placement="bottom">
        {/* Span around IconButton is a workaround for https://mui.com/material-ui/react-tooltip/#disabled-elements */}
        <IconButton
          sx={{
            "&:hover": {
              backgroundColor: color.gray.line,
              borderRadius: "12px",
            },
            color: color.black.medium,
            opacity: canUndo ? 1 : 0.4,
          }}
          disabled={!canUndo}
          onClick={onUndo}>
          <img src={UndoIcon} alt="Undo" />
        </IconButton>
      </Tooltip>
      <Tooltip title={"Redo (R)"} placement="bottom">
        <IconButton
          sx={{
            "&:hover": {
              backgroundColor: color.gray.line,
              borderRadius: "12px",
            },
            color: color.black.medium,
            opacity: canRedo ? 1 : 0.4,
          }}
          disabled={!canRedo}
          onClick={onRedo}>
          <img src={RedoIcon} alt="Redo" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const Zoom: React.FC = () => {
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 1.5;

  // floating point arithmetic created zoom level such as 0.70000000000001, so we
  // started using predefined values.
  const ZOOM_LEVELS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

  const zoom = useSelector((state) => state.zoom);
  const dispatch = useDispatch();

  const onIncrease = () => {
    if (zoom >= MAX_ZOOM) return;
    const currentZoomIdx = ZOOM_LEVELS.findIndex((z) => z === zoom);
    dispatch({
      type: "CHANGE_ZOOM",
      payload: ZOOM_LEVELS[currentZoomIdx + 1],
    });
  };

  const onDecrease = () => {
    if (zoom <= MIN_ZOOM) return;
    const currentZoomIdx = ZOOM_LEVELS.findIndex((z) => z === zoom);
    dispatch({
      type: "CHANGE_ZOOM",
      payload: ZOOM_LEVELS[currentZoomIdx - 1],
    });
  };

  useHotkeys("i", onDecrease, [zoom]);
  useHotkeys("o", onIncrease, [zoom]);

  return (
    <>
      <Tooltip title={"Zoom Out (O)"} placement="top">
        <IconButton
          sx={{
            "&:hover": {
              backgroundColor: color.gray.line,
              borderRadius: "12px",
            },
            color: color.black.medium,
            opacity: zoom <= MIN_ZOOM ? 0.4 : 1,
          }}
          disabled={zoom <= MIN_ZOOM}
          onClick={onDecrease}>
          <img src={ZoomOutIcon} alt="Zoom Out" />
        </IconButton>
      </Tooltip>
      <Tooltip title={"Zoom In (I)"} placement="top">
        <IconButton
          sx={{
            "&:hover": {
              backgroundColor: color.gray.line,
              borderRadius: "12px",
            },
            color: color.black.medium,
            opacity: zoom >= MAX_ZOOM ? 0.4 : 1,
          }}
          disabled={zoom >= MAX_ZOOM}
          onClick={onIncrease}>
          <img src={ZoomInIcon} alt="Zoom In" />
        </IconButton>
      </Tooltip>
    </>
  );
};

const Help = () => {
  return (
    <>
      <Tooltip title={"Help"} placement="bottom">
        <span>
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: color.gray.line,
                borderRadius: "12px",
              },
              color: color.black.medium,
            }}
            onClick={() => {}}>
            <img src={HelpIcon} alt="Help" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

const HeaderTools: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}>
      <Zoom />
      <Divider />
      <UndoAndRedo />
      <Divider />
      <Help />
    </div>
  );
};

// Other

const FloatingDiv: React.FC<{
  children?: React.ReactNode;
  position: React.CSSProperties;
}> = (props) => {
  const { children, position } = props;
  return (
    <Box
      sx={{
        position: "fixed",
        ...position,
        backgroundColor: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
        zIndex: 500,
        borderRadius: "8px",
        boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      }}>
      {children}
    </Box>
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

export { Header, ExitButtonForCreateTool, FloatingDiv };

//  {/* If a step has tool specific description then show that, if not, show default step description. */}
// {STEPS[stepIndex].toolDescription[activeTool] ??
//   STEPS[stepIndex].description}
