/** @jsxImportSource @emotion/react */

// This file contains code related to the label step. Earlier, we had
// code related to each step spread across multiple files, the reason
// was that we architected the intial technical spike around tools.
// Now, we have a single file for each step. Eventhough we have a lot
// of repetitive code because of this change, eventually, we will
// refactor and fix it.

import { Dispatch } from "redux";
import { LabelLayerActionMenu } from "../components/ActionMenu";
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
                backgroundColor: "rgb(36, 148, 178, 0.4)",
                border: "3px solid rgb(36, 148, 178)",
                type: "LABEL",
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
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox
          nodeRef={ref}
          css={{ cursor: "inherit", ...css }}></TranslucentBox>
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
            <LabelLayerActionMenu
              onDelete={() => {
                dispatch({
                  type: "DELETE_ANNOTATION",
                  payload: Object.keys(selectedAnnotations),
                });
              }}
              onUpdateLabel={() => {
                dispatch({
                  type: "CHANGE_TOOL",
                  payload: "CREATE",
                });
              }}
            />
          )}
        </TranslucentBox>
      );
    }
    default:
      return null;
  }
};
