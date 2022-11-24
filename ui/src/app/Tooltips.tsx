/** @jsxImportSource @emotion/react */
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "./StoreProvider";
import { FloatingDiv } from "./Zoom";

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

    return (
      <FloatingDiv
        position={{
          left: "4.5rem",
          bottom: "24px",
        }}>
        <div style={{ padding: "0.5rem" }}>
          <div style={{ fontWeight: "bold" }}>Additional Tooltip</div>
          <div
            style={{
              fontSize: "0.9rem",
              paddingTop: "0.4rem",
              paddingBottom: "1rem",
              maxWidth: "42ch",
            }}>
            Add data format (. DDMMYYY, .Capital), conditions (. Required) or
            additional instructions such as table row number (. 1) for fields.
            <b>
              {" "}
              As you type, the text automatically gets added to the tooltip.
            </b>
          </div>
          <TextField
            fullWidth
            size="small"
            placeholder="Ex. DDMMYYY"
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
        </div>
      </FloatingDiv>
    );
  }

  return null;
};

export { CustomTooltip, PreviewTooltipCheckbox };
