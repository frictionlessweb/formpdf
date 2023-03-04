/** @jsxImportSource @emotion/react */

import { GroupLayerActionMenu } from "../components/ActionMenu";
import color from "../components/color";
import {
  TranslucentBox,
  HandlerLayer,
  ResizeHandle,
  useSelectAnnotation,
  AnnotationBeingSelected,
} from "./Annotation";
import {
  useSelector,
  useDispatch,
  LayerControllerProps,
  Annotation as AnnotationStatic,
  BackgroundColors,
  Borders,
} from "./StoreProvider";
import React from "react";

const useGroupLayer = (div: React.MutableRefObject<HTMLDivElement | null>) => {
  const dispatch = useDispatch();

  const {
    div: selectContainer,
    selectionState,
    newSelectionBounds,
    resetSelectionState,
    updateSelectionState,
  } = useSelectAnnotation(div, [
    "GROUP",
    "GROUP_LABEL",
    "LABEL",
    "TEXTBOX",
    "SIGNATURE",
    "DATE",
  ]);

  return {
    cursor: "auto",
    selectionState,
    container: selectContainer,
    onMouseDown: (e: React.MouseEvent<Element, MouseEvent>) => {
      // we clear already selected annotations when users starts a new selection.
      dispatch({
        type: "DESELECT_ALL_ANNOTATION",
      });
      newSelectionBounds(e);
    },
    onMouseMove: updateSelectionState,
    onMouseUp: () => {
      if (!selectionState) return;
      dispatch({
        type: "SELECT_ANNOTATION",
        payload: selectionState.annotations.map((a) => a.id),
      });
      resetSelectionState();
    },
  };
};

const GroupLayerSelectAnnotation: React.FC<AnnotationStatic> = (
  annotationProps
) => {
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);
  const annotations = useSelector((state) => state.annotations);
  const groupRelations = useSelector((state) => state.groupRelations);
  const dispatch = useDispatch();
  const { id, children, type, ...cssProps } = annotationProps;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };

  const isSelected = Boolean(selectedAnnotations[annotationProps.id]);
  const isFirstSelection =
    Object.keys(selectedAnnotations)[0] === annotationProps.id;

  const groupRelationIds = new Set(Object.values(groupRelations).flat());
  const trulySelectedAnnotations: Array<string> = Object.keys(
    selectedAnnotations
  ).filter((key) => {
    return selectedAnnotations[key] === true;
  });
  const shouldShowGroupDelete = trulySelectedAnnotations.every((annotation) => {
    return groupRelationIds.has(annotation);
  });

  if (type === "GROUP") {
    // Render just a normal div that doesn't have interactions.
    return (
      <TranslucentBox
        id={id}
        css={{
          ...css,
          border: `3px solid ${color.brown.dark}`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    );
  }
  return (
    <>
      {isFirstSelection && (
        <GroupLayerActionMenu
          position={{
            left: css.left,
            top: css.top,
          }}
          showDelete={shouldShowGroupDelete}
          onDelete={() => {
            if (type === "RADIOBOX" || "CHECKBOX") {
              dispatch({
                type: "REMOVE_FROM_GROUP",
                payload: Object.keys(selectedAnnotations),
              });
            }
          }}
          onCreateNewGroup={() => {
            const uuid = window.crypto.randomUUID();
            // this is step 1. Here we start by creating a group.
            dispatch({
              type: "CREATE_GROUP_RELATION",
              payload: {
                from: {
                  ui: {
                    id: uuid,
                    backgroundColor: BackgroundColors["GROUP"],
                    border: Borders["GROUP"],
                    type: "GROUP",
                  },
                  // here tokens mean the annotations
                  tokens: Object.keys(selectedAnnotations).map((id) => {
                    return {
                      height: annotations[id].height,
                      left: annotations[id].left,
                      top: annotations[id].top,
                      width: annotations[id].width,
                    };
                  }),
                },
                to: Object.keys(selectedAnnotations),
              },
            });
          }}
        />
      )}
      <TranslucentBox
        id={id}
        css={{
          cursor: "pointer",
          ...css,
          zIndex: isSelected ? 100 : 0,
          border: isSelected ? "3px solid black" : css.border,
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
      />
    </>
  );
};

const GroupLayerSelections = () => {
  const allAnnotations = useSelector((state) => state.annotations);

  const annotations = Object.values(allAnnotations).filter((annotation) => {
    return (
      annotation.type === "CHECKBOX" ||
      annotation.type === "RADIOBOX" ||
      annotation.type === "GROUP"
    );
  });
  return (
    <>
      {annotations.map((annotation) => {
        return (
          <React.Fragment key={annotation.id}>
            <GroupLayerSelectAnnotation {...annotation} />
          </React.Fragment>
        );
      })}
    </>
  );
};
const GroupLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const layer = useGroupLayer(container);
  return (
    <HandlerLayer
      pdf={pdf}
      rootCss={{ cursor: layer.cursor }}
      onMouseDown={layer.onMouseDown}
      onMouseMove={layer.onMouseMove}
      onMouseUp={layer.onMouseUp}>
      <ResizeHandle container={container} pdf={pdf} />
      {/* Layer 1 */}
      {layer.selectionState && (
        <AnnotationBeingSelected selectionState={layer.selectionState} />
      )}
      {/* Layer 2 */}
      <GroupLayerSelections />
    </HandlerLayer>
  );
};

export default GroupLayer;
