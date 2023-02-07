/** @jsxImportSource @emotion/react */
import React, { useState } from "react";
import Steps from "./Steps";
import Button from "@mui/material/Button";
import { useSelector, useDispatch, Step, STEPS } from "./StoreProvider";
import color from "../components/color";
import { useHotkeys } from "react-hotkeys-hook";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import DividerIcon from "./assets/images/divider.svg";
import Box, { BoxProps } from "@mui/material/Box";
import { IconButton, Tooltip } from "@mui/material";
import RedoIcon from "./assets/images/redo.svg";
import UndoIcon from "./assets/images/undo.svg";
import ZoomInIcon from "./assets/images/zoom_in.svg";
import ZoomOutIcon from "./assets/images/zoom_out.svg";
import HelpIcon from "./assets/images/help.svg";
import tutorialImage from "./assets/images/tooltip_tutorial_image.png";
import { handleFormChange, LOCAL_STORAGE_KEY } from "./utils";

const getStepIndex = (activeStep: string) => {
  return STEPS.findIndex((step) => step.id === activeStep);
};

const Header: React.FC = () => {
  const activeStep = useSelector((state) => state.step);
  const dispatch = useDispatch();
  const goToStep = async (step: Step) => {
    dispatch({ type: "GOTO_STEP", payload: step });
  };
  const stepIndex = getStepIndex(activeStep);
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
export const getCurrentFormNumber = () => {
  return window.location.hash === "" ? "1" : window.location.hash.substring(1);
};

const LogoAndFormSelect: React.FC = () => {
  // we cannot use useState here as we are reloading the page and clearing state
  // and all information will be lost this way.
  const currentForm = getCurrentFormNumber();

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
          onChange={handleFormChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}>
          <MenuItem value={1}>Form 1</MenuItem>
          <MenuItem value={2}>Form 2</MenuItem>
          <MenuItem value={3}>Form 3</MenuItem>
          <MenuItem value={4}>Form 4</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

// Middle of Header

const NextStepButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step);
  const isLastStep = step === "LABEL_LAYER";

  const saveState = () => {
    const fileName = "form_" + getCurrentFormNumber() + ".json";
    const state: string = window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "";
    const data = new Blob([state], { type: "text/json" });
    const jsonURL = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.href = jsonURL;
    link.setAttribute("download", fileName);
    link.click();
    document.body.removeChild(link);
    return;
  };

  const onNext = () => {
    if (isLastStep) {
      setOpen(true);
    }
    dispatch({ type: "GOTO_NEXT_STEP" });
  };

  useHotkeys("n", onNext, [step]);

  return (
    <>
      <Button
        sx={{
          borderRadius: "50px",
          textTransform: "none",
          fontWeight: "600",
          backgroundColor: color.blue.medium,
          width: "6.5rem",
        }}
        size="small"
        disableElevation
        onClick={onNext}
        variant="contained">
        {isLastStep ? "Finish" : "Next Step"}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Save PDF?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Congratulations! You have successfully made your PDF form
            accessible. To save the changes, simply click the 'Save' button
            below.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveState} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const PrevStepButton: React.FC = () => {
  const dispatch = useDispatch();
  const step = useSelector((state) => state.step);
  const currentSection = useSelector((state) => state.currentSection);

  const isFirstStep = step === "FIELD_LAYER";
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
      Prev Step
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
        <IconButton
          sx={{
            border: `1.5px solid ${color.gray.line}`,
            boxShadow: "0px 3px 16px 0px rgba(100, 100, 111, 0.2)",
            position: "absolute",
            top: "80px",
            left: "50%",
            zIndex: 500,
            backgroundColor: color.white.medium,
            borderRadius: "12px",
            "&:hover": {
              backgroundColor: color.gray.line,
            },
            color: color.black.medium,
          }}
          onClick={() => {
            dispatch({ type: "CHANGE_TOOL", payload: "SELECT" });
          }}>
          <ClearIcon />
        </IconButton>
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

const Help: React.FC = () => {
  const [show, setShow] = useState(false);
  const activeTool = useSelector((state) => state.tool);
  const activeStep = useSelector((state) => state.step);

  const stepIndex = getStepIndex(activeStep);
  // If a step has tool specific description then show that, if not, show default step description.
  let helpBody = (
    <>
      {STEPS[stepIndex].toolDescription[activeTool] ??
        STEPS[stepIndex].description}
    </>
  );

  const isLabelStepAndCreateTool =
    activeStep === "LABEL_LAYER" && activeTool === "CREATE";

  if (isLabelStepAndCreateTool) {
    helpBody = (
      <>
        <img width="248px" src={tutorialImage} alt="" />
        Drag and Select the words that you want to set as label for the field.
      </>
    );
  }

  const HelpDialog = (
    <>
      {show && (
        <FloatingDiv position={{ right: 16, top: 72 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "32ch",
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}>
              <div style={{ padding: "0px 8px 0px 8px", fontWeight: "bold" }}>
                Help
              </div>
              <IconButton
                sx={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "8px",
                  color: color.gray.dark,
                  "&:hover": {
                    backgroundColor: color.gray.line,
                  },
                  marginBottom: "2px",
                }}
                onClick={() => {
                  setShow(!show);
                }}>
                <ClearIcon sx={{ transform: "scale(0.8,0.8)" }} />
              </IconButton>
            </div>
            <div style={{ padding: "0px 8px 8px 8px" }}>{helpBody}</div>
          </div>
        </FloatingDiv>
      )}
    </>
  );
  return (
    <>
      <Tooltip title={"Help"} placement="bottom">
        <IconButton
          sx={{
            "&:hover": {
              backgroundColor: color.gray.line,
              borderRadius: "12px",
            },
            color: color.black.medium,
          }}
          onClick={() => {
            setShow(!show);
          }}>
          <img src={HelpIcon} alt="Help" />
        </IconButton>
      </Tooltip>
      {HelpDialog}
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
        padding: "4px",
        zIndex: 500,
        borderRadius: "8px",
        border: `1.5px solid ${color.gray.line}`,
        boxShadow: "0px 3px 6px 0px rgba(100, 100, 111, 0.2)",
      }}>
      {children}
    </Box>
  );
};

export { Header, ExitButtonForCreateTool, FloatingDiv };
