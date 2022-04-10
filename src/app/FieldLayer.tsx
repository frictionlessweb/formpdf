/** @jsxImportSource @emotion/react */

// This file contains code related to the field step. Earlier, we had
// code related to each step spread across multiple files, the reason
// was that we architected the intial technical spike around tools.
// Now, we have a single file for each step. Eventhough we have a lot
// of repetitive code because of this change, eventually, we will
// refactor and fix it.

import { Dispatch } from "redux";
import { CreateAnnotationAttr, NO_OP, RenderAnnotationsHandler } from "./PDF";
import Annotation, {
  AnnotationBeingCreated,
  CreationState,
  mapCreationBoundsToFinalBounds,
} from "./Annotation";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { AnnotationProps, TranslucentBox } from "./Annotation";
import {
  AccessibleForm,
  TOOL,
  Annotation as AnnotationType,
} from "./StoreProvider";
import { Rnd } from "react-rnd";

export const fieldLayerHandlers = (
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
            type: "CREATE_ANNOTATION",
            payload: {
              id: window.crypto.randomUUID(),
              backgroundColor: "rgb(255, 182, 193, 0.3)",
              border: "3px solid red",
              type: "TEXTBOX",
              ...mapCreationBoundsToFinalBounds(creationState.bounds),
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

// For some reason, with React RND, if you don't offset the top and the left
// by *exactly* two pixels, it doesn't look right.
const MYSTERIOUS_RND_OFFSET = 2;

export const FieldLayerTools = (
  props: AnnotationProps,
  ref: React.MutableRefObject<HTMLDivElement | null> | undefined,
  state: AccessibleForm,
  dispatch: Dispatch
) => {
  console.log(props);
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
      // When multiple selections are made, we want to show action menu on
      // the annotation which was selected first from the set.
      const isFirstSelection = Object.keys(selectedAnnotations)[0] === props.id;
      return (
        <Rnd
          allowAnyClick
          style={{
            position: "absolute",
            border: isSelected ? "3px solid black" : props.border,
            backgroundColor: props.backgroundColor,
          }}
          position={{
            x: props.left + MYSTERIOUS_RND_OFFSET,
            y: props.top + MYSTERIOUS_RND_OFFSET,
          }}
          size={{ height: props.height, width: props.width }}
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
          }}
          css={{
            ...css,
            border: isSelected ? "2px solid black" : css.border,
          }}
          onDragStop={(_, delta) => {
            dispatch({
              type: "MOVE_ANNOTATION",
              payload: {
                id: props.id,
                x: delta.x - MYSTERIOUS_RND_OFFSET,
                y: delta.y - MYSTERIOUS_RND_OFFSET,
              },
            });
          }}
          onResize={(_, __, ref, ___, el) => {
            dispatch({
              type: "RESIZE_ANNOTATION",
              payload: {
                id: props.id,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: el.x - MYSTERIOUS_RND_OFFSET,
                y: el.y - MYSTERIOUS_RND_OFFSET,
              },
            });
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
        </Rnd>
      );
    }
  }
};

export const renderFieldLayerAnnotations = (
  step: number,
  tool: TOOL,
  creationState: CreationState | null,
  handlers: RenderAnnotationsHandler,
  annotations: Array<AnnotationType>
) => {
  return (
    <>
      <AnnotationBeingCreated
        creationState={creationState}
        showTokens={false}
        {...handlers}
      />
      {annotations.map((annotation) => {
        return <Annotation key={annotation.id} {...annotation} />;
      })}
    </>
  );
};
