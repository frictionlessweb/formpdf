/** @jsxImportSource @emotion/react */
import React from "react";
import { NO_OP } from "./PDF";
import {
  AnnotationBeingCreated,
  mapCreationBoundsToFinalBounds,
  useCreateAnnotation,
  HandlerLayer,
  ResizeHandle,
} from "./Annotation";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { AnnotationProps, TranslucentBox } from "./Annotation";
import color from "../components/color";
import {
  useSelector,
  useDispatch,
  LayerControllerProps,
  fieldTypes,
  BackgroundColors,
  Borders,
} from "./StoreProvider";
import { Rnd } from "react-rnd";

export const useFieldLayer = (
  div: React.MutableRefObject<HTMLDivElement | null>
) => {
  const attr = useCreateAnnotation(div);
  const dispatch = useDispatch();
  const { tool, page } = useSelector((state) => {
    return {
      tool: state.tool,
      page: state.page,
    };
  });
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
              page,
              corrected: true,
              customTooltip: "",
              backgroundColor: BackgroundColors["TEXTBOX"],
              border: Borders["TEXTBOX"],
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
          dispatch({ type: "DESELECT_ALL_ANNOTATION" });
        },
      };
    }
  }
};

// This signifier helps users to understand that they can click and drag to resize the selected annotation.
const ResizeHandleForAnnotations: React.FC = () => {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
      <div
        style={{
          height: "90%",
          width: "90%",
          border: "3px solid black",
          backgroundColor: "white",
        }}
      />
    </div>
  );
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
          css={{
            cursor: "inherit",
            ...css,
          }}>
          <span
            style={{
              color: color.black.medium,
              fontWeight: "bold",
              fontFamily: "Times New Roman",
              paddingLeft: "4px",
            }}>
            {typeLabel}
          </span>
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
            backgroundColor: cssProps.backgroundColor,
            // Here zIndex is used to fix the issue where – the action menu (which is a child of selected annotation)
            // gets overlapped by previous section's grey area.
            zIndex: isSelected ? 100 : 0,
            border: isSelected ? "4px solid black" : cssProps.border,
          }}
          enableResizing={isSelected}
          resizeHandleComponent={{
            topRight: <ResizeHandleForAnnotations />,
            bottomRight: <ResizeHandleForAnnotations />,
            bottomLeft: <ResizeHandleForAnnotations />,
            topLeft: <ResizeHandleForAnnotations />,
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
          <span
            style={{
              color: color.black.medium,
              fontWeight: "bold",
              fontFamily: "Times New Roman",
              paddingLeft: "4px",
            }}>
            {typeLabel}
          </span>
        </Rnd>
      );
    }
  }
};

const FieldLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const annotations = useSelector((state) => {
    return Object.values(state.annotations).filter((annotation) =>
      fieldTypes.includes(annotation.type)
    );
  });
  const layer = useFieldLayer(container);
  return (
    <HandlerLayer
      pdf={pdf}
      rootCss={{ cursor: layer.cursor }}
      onMouseMove={layer.onMouseMove}
      onMouseDown={layer.onMouseDown}
      onMouseUp={layer.onMouseUp}
      onClick={layer.onClick}>
      <ResizeHandle pdf={pdf} container={container} />
      <AnnotationBeingCreated
        creationState={layer.creationState}
        showTokens={false}
        onMouseUp={NO_OP}
        onMouseDown={NO_OP}
        onMouseMove={NO_OP}
      />
      {annotations.map((annotation) => {
        return <FieldLayerAnnotation key={annotation.id} {...annotation} />;
      })}
    </HandlerLayer>
  );
};

export default FieldLayer;
