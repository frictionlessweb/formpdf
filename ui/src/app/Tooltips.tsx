/** @jsxImportSource @emotion/react */
import { TextField, IconButton } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "./StoreProvider";
import { FloatingDiv } from "./Zoom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(9px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#177ddc" : "#1890ff",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const PreviewTooltipCheckbox: React.FC = () => {
  const step = useSelector((state) => state.step);
  const tool = useSelector((state) => state.tool);
  const previewTooltips = useSelector((state) => state.previewTooltips);
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
          <div
            style={{
              padding: "0.5rem 1.25rem 0.5rem 0.75rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "0.5rem",
            }}>
            <AntSwitch
              checked={previewTooltips}
              onChange={handlePrevewTooltipsChange}
            />
            Preview Tooltip
          </div>
        </FloatingDiv>
      )}
    </>
  );
};

const CustomTooltip: React.FC = () => {
  const [expanded, setExpanded] = React.useState(true);
  const annotations = useSelector((state) => state.annotations);
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);
  const step = useSelector((state) => state.step);
  const tool = useSelector((state) => state.tool);
  const dispatch = useDispatch();
  const allSelectedAnnotation = Object.keys(selectedAnnotations);
  const totalSelections = allSelectedAnnotation.length;

  const showCustomTooltip =
    step === "LABEL_LAYER" && tool === "SELECT" && totalSelections === 1;

  if (showCustomTooltip) {
    const selectedAnnotationId = allSelectedAnnotation[0];
    const selectedAnnotation = annotations[selectedAnnotationId];

    if (selectedAnnotation.type === "GROUP") {
      return null;
    }

    const AccordianTitle = (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}>
        <div style={{ fontWeight: "bold" }}>Additional Tooltip</div>
        <IconButton
          onClick={() => {
            setExpanded(!expanded);
          }}>
          {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </div>
    );
    const AccordianBody = (
      <>
        <div
          style={{
            paddingTop: "0.2rem",
            paddingBottom: "1rem",
          }}>
          Add data format (. DDMMYYY, . Capital), conditions (. Required) or
          additional instructions such as table row number (. 1) for fields.
          <b> As you type, the text automatically gets added to the tooltip.</b>
        </div>
        <TextField
          sx={{
            paddingBottom: "0.3rem",
          }}
          fullWidth
          size="small"
          placeholder=". DDMMYYY, . Required or . 1"
          margin="none"
          onClick={(e) => {
            e.stopPropagation();
          }}
          value={selectedAnnotation.customTooltip}
          onChange={(e) => {
            dispatch({
              type: "CHANGE_CUSTOM_TOOLTIP",
              payload: {
                id: selectedAnnotationId,
                customTooltip: e.target.value,
              },
            });
          }}
        />
      </>
    );

    return (
      <FloatingDiv
        position={{
          left: "4.5rem",
          bottom: "24px",
        }}>
        <div
          style={{
            width: "39ch",
            paddingLeft: "0.4rem",
            paddingRight: "0.4rem",
          }}>
          {AccordianTitle}
          {expanded && AccordianBody}
        </div>
      </FloatingDiv>
    );
  }

  return null;
};

export { CustomTooltip, PreviewTooltipCheckbox };
