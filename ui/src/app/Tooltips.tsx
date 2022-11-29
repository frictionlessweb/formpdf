/** @jsxImportSource @emotion/react */
import {
  Checkbox,
  FormControlLabel,
  TextField,
  IconButton,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "./StoreProvider";
import { FloatingDiv } from "./Zoom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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

const CustomTooltip: React.FC = () => {
  const [expanded, setExpanded] = React.useState(true);
  const annotations = useSelector((state) => state.annotations);
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);
  const step = useSelector((state) => state.step);
  const dispatch = useDispatch();
  const allSelectedAnnotation = Object.keys(selectedAnnotations);
  const totalSelections = allSelectedAnnotation.length;

  if (step === "LABEL_LAYER" && totalSelections === 1) {
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
            fontSize: "0.9rem",
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
