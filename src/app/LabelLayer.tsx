/** @jsxImportSource @emotion/react */
import { Dispatch } from "redux";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { AnnotationProps, TranslucentBox } from "./Annotation";
import { CreateAnnotationAttr, NO_OP } from "./PDF";
import { AccessibleForm, TOOL } from "./StoreProvider";

export const labelLayerHandlers = (
  tool: TOOL,
  dispatch: Dispatch,
  createAnnotationAttr: CreateAnnotationAttr
) => {
  const {
    div: container,
    creationState,
    newCreationBounds,
    resetCreationState,
    updateCreationState,
  } = createAnnotationAttr;

  switch (tool) {
    case "CREATE": {
      return {
        cursor: "crosshair",
        creationState,
        container,
        onClick: NO_OP,
        onMouseDown: newCreationBounds,
        onMouseMove: updateCreationState,
        onMouseLeave: resetCreationState,
        onMouseUp: () => {
          if (!creationState) return;
          dispatch({
            type: "CREATE_ANNOTATION_FROM_TOKENS",
            payload: {
              ui: {
                id: window.crypto.randomUUID(),
                backgroundColor: "rgb(255, 182, 193, 0.3)",
                border: "3px solid red",
                type: "TEXTBOX",
              },
              tokens: creationState.tokens,
            },
          });
          resetCreationState();
        },
      };
    }
    case "SELECT": {
      return {
        cursor: "auto",
        creationState,
        container,
        onMouseMove: NO_OP,
        onMouseUp: NO_OP,
        onMouseDown: NO_OP,
        onMouseLeave: NO_OP,
        onClick: () => {
          if (tool === "SELECT") {
            dispatch({ type: "DESELECT_ALL_ANNOTATION" });
          }
        },
      };
    }
  }
};

export const LabelLayerTools = (
  props: AnnotationProps,
  ref: React.MutableRefObject<HTMLDivElement | null> | undefined,
  state: AccessibleForm,
  dispatch: Dispatch
) => {
  const { tool, selectedAnnotations } = state;
  const { id, type, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  const typeLabel = type.slice(0, 1);
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox nodeRef={ref} css={{ cursor: "inherit", ...css }}>
          {typeLabel}
        </TranslucentBox>
      );
    }
    case "SELECT": {
      const isSelected = Boolean(selectedAnnotations[props.id]);
      const isFirstSelection = Object.keys(selectedAnnotations)[0] === props.id;
      return (
        <TranslucentBox
          css={{
            cursor: "pointer",
            ...css,
            border: isSelected ? "2px solid black" : css.border,
          }}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            const shiftNotPressed = !e.shiftKey;
            if (shiftNotPressed) {
              dispatch({ type: "DESELECT_ALL_ANNOTATION" });
            }
            if (isSelected) {
              dispatch({ type: "DESELECT_ANNOTATION", payload: props.id });
            } else {
              dispatch({ type: "SELECT_ANNOTATION", payload: props.id });
            }
          }}>
          {isFirstSelection && (
            <FieldLayerActionMenu
              onDelete={() => {
                dispatch({
                  type: "DELETE_ANNOTATION",
                  payload: Object.keys(selectedAnnotations),
                });
              }}
              onFieldTypeChange={(value) => {
                dispatch({
                  type: "SET_ANNOTATION_TYPE",
                  payload: {
                    ids: Object.keys(selectedAnnotations),
                    type: value,
                  },
                });
              }}
            />
          )}
          {typeLabel}
        </TranslucentBox>
      );
    }
    default:
      return null;
  }
};
