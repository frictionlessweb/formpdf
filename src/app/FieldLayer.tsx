/** @jsxImportSource @emotion/react */
import React from "react";
import { Dispatch } from "redux";
import { CreateAnnotationAttr, NO_OP, RenderAnnotationsHandler } from "./PDF";
import Annotation, {
  AnnotationBeingCreated,
  CreationState,
  mapCreationBoundsToFinalBounds,
  useCreateAnnotation,
  HandlerLayer,
} from "./Annotation";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { AnnotationProps, TranslucentBox } from "./Annotation";
import { useSelector, useDispatch, AccessibleForm } from "./StoreProvider";
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
          // FIXME: Can we move this logic from here into the reducer, creating another action if necessary?
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

export const fieldLayerHandlers = (
  state: AccessibleForm,
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
  const { tool } = state;

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
          // FIXME: Can we move this logic from here into the reducer, creating another action if necessary?
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
          allowAnyClick
          style={{
            position: "absolute",
            border: isSelected ? "3px solid black" : annotationProps.border,
            backgroundColor: annotationProps.backgroundColor,
          }}
          position={{
            x: annotationProps.left + MYSTERIOUS_RND_OFFSET,
            y: annotationProps.top + MYSTERIOUS_RND_OFFSET,
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
          css={{
            ...css,
            border: isSelected ? "2px solid black" : css.border,
          }}
          onDragStop={(_, delta) => {
            dispatch({
              type: "MOVE_ANNOTATION",
              payload: {
                id: annotationProps.id,
                x: delta.x - MYSTERIOUS_RND_OFFSET,
                y: delta.y - MYSTERIOUS_RND_OFFSET,
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

export const FieldLayerAllAnnotations: React.FC<{
  creationState: CreationState | null;
  handlers: RenderAnnotationsHandler;
}> = ({ creationState, handlers }) => {
  const [annotations] = useSelector((state) => [
    Object.values(state.annotations),
  ]);
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
        onMouseDown={layer.onMouseDown}
        onMouseMove={layer.onMouseMove}
        onMouseUp={layer.onMouseUp}
      />
      {Object.values(annotations).map((annotation) => {
        return <FieldLayerAnnotation key={annotation.id} {...annotation} />;
      })}
    </HandlerLayer>
  );
};

export default FieldLayer;
