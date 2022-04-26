/** @jsxImportSource @emotion/react */
import React from "react";
import { NO_OP } from "./PDF";
import {
  AnnotationBeingCreated,
  mapCreationBoundsToFinalBounds,
  useCreateAnnotation,
  HandlerLayer,
} from "./Annotation";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { AnnotationProps, TranslucentBox } from "./Annotation";
import { useSelector, useDispatch } from "./StoreProvider";
import { Rnd } from "react-rnd";

export const useFieldLayer = () => {
  const attr = useCreateAnnotation();
  const dispatch = useDispatch();
  const tool = useSelector((state) => state.tool);
  const {
    div: container,
    creationState,
    newCreationBounds,
    resetCreationState,
    updateCreationState,
  } = attr;
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

export const FieldLayerAnnotation: React.FC<AnnotationProps> = (props) => {
  const [tool, selectedAnnotations] = useSelector((state) => [
    state.tool,
    state.selectedAnnotations,
  ]);
  const annotationRef = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const { id, type, children, ...cssProps } = props;
  const annotationProps = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  const typeLabel = type.slice(0, 1);
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox
          id={id}
          nodeRef={annotationRef}
          css={{ cursor: "inherit", ...css }}>
          {typeLabel}
        </TranslucentBox>
      );
    }
    case "SELECT": {
      const isSelected = Boolean(selectedAnnotations[annotationProps.id]);
      // When multiple selections are made, we want to show action menu on
      // the annotation which was selected first from the set.
      const isFirstSelection =
        Object.keys(selectedAnnotations)[0] === annotationProps.id;
      return (
        <Rnd
          css={{
            ...css,
            position: "absolute",
            border: isSelected ? "3px solid black" : "3px solid red",
          }}
          allowAnyClick
          position={{
            x: annotationProps.left,
            y: annotationProps.top,
          }}
          size={{
            height: annotationProps.height,
            width: annotationProps.width,
          }}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            const shiftNotPressed = !e.shiftKey;
            if (shiftNotPressed) {
              dispatch({ type: "DESELECT_ALL_ANNOTATION" });
            }
            if (isSelected) {
              dispatch({
                type: "DESELECT_ANNOTATION",
                payload: annotationProps.id,
              });
            } else {
              dispatch({
                type: "SELECT_ANNOTATION",
                payload: annotationProps.id,
              });
            }
          }}
          onDragStop={(_, delta) => {
            dispatch({
              type: "MOVE_ANNOTATION",
              payload: {
                id: annotationProps.id,
                x: delta.x,
                y: delta.y,
              },
            });
          }}
          onResize={(_, __, ref, ___, el) => {
            dispatch({
              type: "RESIZE_ANNOTATION",
              payload: {
                id: annotationProps.id,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: el.x,
                y: el.y,
              },
            });
          }}>
          {isFirstSelection && (
            <FieldLayerActionMenu
              value={annotationProps.type}
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

const FieldLayer: React.FC = () => {
  const annotations = useSelector((state) => state.annotations);
  const layer = useFieldLayer();
  return (
    <HandlerLayer
      rootCss={{ cursor: layer.cursor }}
      onMouseMove={layer.onMouseMove}
      onMouseDown={layer.onMouseDown}
      onMouseUp={layer.onMouseUp}>
      <AnnotationBeingCreated
        creationState={layer.creationState}
        showTokens={false}
        onMouseUp={NO_OP}
        onMouseDown={NO_OP}
        onMouseMove={NO_OP}
      />
      {Object.values(annotations).map((annotation) => {
        return <FieldLayerAnnotation key={annotation.id} {...annotation} />;
      })}
    </HandlerLayer>
  );
};

export default FieldLayer;
