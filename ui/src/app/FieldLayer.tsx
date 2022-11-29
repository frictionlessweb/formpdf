/** @jsxImportSource @emotion/react */
import React from "react";
import { NO_OP } from "./PDF";
import {
  AnnotationBeingCreated,
  mapCreationBoundsToFinalBounds,
  useCreateAnnotation,
  HandlerLayer,
  ResizeHandle,
  useSelectAnnotation,
  AnnotationBeingSelected,
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
import { useHotkeys } from "react-hotkeys-hook";

export const useFieldLayer = (
  div: React.MutableRefObject<HTMLDivElement | null>
) => {
  const {
    div: createContainer,
    creationState,
    newCreationBounds,
    resetCreationState,
    updateCreationState,
  } = useCreateAnnotation(div);

  const {
    div: selectContainer,
    selectionState,
    newSelectionBounds,
    resetSelectionState,
    updateSelectionState,
  } = useSelectAnnotation(div);

  const dispatch = useDispatch();
  const tool = useSelector((state) => state.tool);
  const page = useSelector((state) => state.page);

  switch (tool) {
    case "CREATE": {
      return {
        cursor: "crosshair",
        creationState,
        container: createContainer,
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
        selectionState,
        container: selectContainer,
        onMouseDown: newSelectionBounds,
        onMouseMove: updateSelectionState,
        onMouseUp: () => {
          if (!selectionState) return;
          // if no selection is inside the bound created by user, then deselect all.
          if (selectionState.annotations.length === 0) {
            dispatch({
              type: "DESELECT_ALL_ANNOTATION",
            });
          } else {
            dispatch({
              type: "SELECT_ANNOTATION",
              payload: selectionState.annotations.map((a) => a.id),
            });
          }
          resetSelectionState();
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
  const tool = useSelector((state) => state.tool);
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);

  const dispatch = useDispatch();
  const { id, type, children, ...css } = props;
  const annotationProps = props;
  const typeLabel = type.slice(0, 1);
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox
          id={id}
          css={{
            cursor: "inherit",
            position: "absolute",
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
        <>
          {isFirstSelection && (
            <FieldLayerActionMenu
              position={{
                left: annotationProps.left,
                top: annotationProps.top,
              }}
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
          <Rnd
            css={{
              ...css,
              position: "absolute",
              // Here zIndex is used to fix the issue where – the action menu (which is a child of selected annotation)
              // gets overlapped by previous section's grey area.
              zIndex: isSelected ? 100 : 0,
              border: isSelected ? "4px solid black" : css.border,
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
            onMouseDown={(e) => {
              // We stop propagation with the goal of preventing annotation being selected.
              e.stopPropagation();
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
                  payload: [annotationProps.id],
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
        </>
      );
    }
  }
};

const FieldLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const allAnnotations = useSelector((state) => state.annotations);
  const annotations = Object.values(allAnnotations).filter((annotation) =>
    fieldTypes.includes(annotation.type)
  );
  const layer = useFieldLayer(container);
  const dispatch = useDispatch();
  useHotkeys("s", () => dispatch({ type: "CHANGE_TOOL", payload: "SELECT" }));
  useHotkeys("c", () => dispatch({ type: "CHANGE_TOOL", payload: "CREATE" }));

  return (
    <HandlerLayer
      pdf={pdf}
      rootCss={{ cursor: layer.cursor }}
      onMouseMove={layer.onMouseMove}
      onMouseDown={layer.onMouseDown}
      onMouseUp={layer.onMouseUp}
      onClick={layer.onClick}>
      <ResizeHandle pdf={pdf} container={container} />
      {/* If there is creationState it means that CREATE tool is being used */}
      {layer.creationState && (
        <AnnotationBeingCreated
          creationState={layer.creationState}
          showTokens={false}
          onMouseUp={NO_OP}
          onMouseDown={NO_OP}
          onMouseMove={NO_OP}
        />
      )}
      {layer.selectionState && (
        <AnnotationBeingSelected
          selectionState={layer.selectionState}
          onMouseUp={NO_OP}
          onMouseDown={NO_OP}
          onMouseMove={NO_OP}
        />
      )}

      {annotations.map((annotation) => {
        return <FieldLayerAnnotation key={annotation.id} {...annotation} />;
      })}
    </HandlerLayer>
  );
};

export default FieldLayer;
