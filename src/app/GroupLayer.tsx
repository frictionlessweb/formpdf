/** @jsxImportSource @emotion/react */

// This file contains code related to the group step. Earlier, we had
// code related to each step spread across multiple files, the reason
// was that we architected the intial technical spike around tools.
// Now, we have a single file for each step. Eventhough we have a lot
// of repetitive code because of this change, eventually, we will
// refactor and fix it.

import { Dispatch } from "redux";
import { GroupLayerActionMenu } from "../components/ActionMenu";
import Annotation, {
  AnnotationBeingCreated,
  AnnotationProps,
  CreationState,
  TranslucentBox,
  HandlerLayer,
} from "./Annotation";
import { CreateAnnotationAttr, NO_OP, RenderAnnotationsHandler } from "./PDF";
import {
  useSelector,
  useDispatch,
  AccessibleForm,
  LayerControllerProps,
} from "./StoreProvider";
import React from "react";
import Xarrow from "react-xarrows";
import { AllTokens } from "./LabelLayer";

export const groupLayerHandlers = (
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
  const { tool, selectedAnnotations } = state;

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
          // The following line stops dispatch of CREATE_ANNOTATION_FROM_TOKENS if no token is selected.
          // It fixes the bug where, an action is dispatched without tokens, empty token created a new
          // annotation whose dimeasions are defined by boxContaning function(as Math.MAX) in utils.
          if (creationState.tokens.length === 0) return;
          const id = window.crypto.randomUUID();
          dispatch({
            type: "CREATE_ANNOTATION_FROM_TOKENS",
            payload: {
              ui: {
                id,
                backgroundColor: "rgb(36, 148, 178, 0.4)",
                border: "3px solid rgb(36, 148, 178)",
                type: "GROUP_LABEL",
              },
              tokens: creationState.tokens,
            },
          });
          dispatch({
            type: "CREATE_LABEL_RELATION",
            payload: { from: Object.keys(selectedAnnotations)[0], to: id },
          });
          resetCreationState();
          // As soon as a label is created, we switch user to the select tool.
          dispatch({
            type: "CHANGE_TOOL",
            payload: "SELECT",
          });
          // After label is created we no longer want annotation to be selected.
          // FIXME: Ask Josh, are actions dispatched in the same order ? Because if we currently
          // selected annotation gets deselected before then we would not be able to
          // create relation.
          dispatch({ type: "DESELECT_ALL_ANNOTATION" });
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

export const GroupLayerAnnotation: React.FC<{
  annotationProps: AnnotationProps;
  annotationRef: React.MutableRefObject<HTMLDivElement | null> | undefined;
}> = ({ annotationProps, annotationRef }) => {
  const [tool, selectedAnnotations, annotations] = useSelector((state) => [
    state.tool,
    state.selectedAnnotations,
    state.annotations,
  ]);
  const dispatch = useDispatch();
  const { id, type, ...cssProps } = annotationProps;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox
          id={id}
          nodeRef={annotationRef}
          css={{ cursor: "inherit", ...css }}></TranslucentBox>
      );
    }
    case "SELECT": {
      const isSelected = Boolean(selectedAnnotations[annotationProps.id]);
      const isFirstSelection =
        Object.keys(selectedAnnotations)[0] === annotationProps.id;
      return (
        <TranslucentBox
          id={id}
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
          }}>
          {isFirstSelection && (
            <GroupLayerActionMenu
              onDelete={() => {}}
              onAddToGroup={() => {}}
              onCreateNewGroup={() => {
                const uuid = window.crypto.randomUUID();
                dispatch({
                  type: "CREATE_ANNOTATION_FROM_TOKENS",
                  payload: {
                    ui: {
                      id: uuid,
                      backgroundColor: "rgb(36, 148, 178, 0.4)",
                      border: "3px solid rgb(36, 148, 178)",
                      type: "GROUP",
                    },
                    tokens: Object.keys(selectedAnnotations).map(
                      (annotationId) => {
                        return {
                          left: annotations[annotationId].left,
                          top: annotations[annotationId].top,
                          width: annotations[annotationId].width,
                          height: annotations[annotationId].height,
                        };
                      }
                    ),
                  },
                });
                dispatch({
                  type: "CREATE_GROUP_RELATION",
                  payload: { from: uuid, to: Object.keys(selectedAnnotations) },
                });
                dispatch({ type: "CHANGE_TOOL", payload: "CREATE" });
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

export const GroupLayerAllAnnotations: React.FC<{
  creationState: CreationState | null;
  handlers: RenderAnnotationsHandler;
}> = ({ creationState, handlers }) => {
  const [annotations, tool, allTokens, labelRelations] = useSelector(
    (state) => [
      state.annotations,
      state.tool,
      state.tokens,
      state.labelRelations,
    ]
  );
  const choiceGroupAnnotations = Object.values(annotations).filter(
    (annotation) =>
      annotation.type === "CHECKBOX" ||
      annotation.type === "RADIOBOX" ||
      annotation.type === "GROUP" ||
      annotation.type === "GROUP_LABEL"
  );
  // FIXME: Make tokens work for multiple pages. Here we are just taking
  // tokens for the first page.
  const tokens = allTokens[0];

  switch (tool) {
    case "CREATE": {
      return (
        <>
          <AnnotationBeingCreated
            creationState={creationState}
            showTokens={true}
            {...handlers}
          />
          <AllTokens tokens={tokens} />
        </>
      );
    }
    case "SELECT": {
      return (
        <>
          {choiceGroupAnnotations.map((annotation) => {
            const labelId = labelRelations[annotation.id];
            const isGroupLabel =
              labelId && annotations[labelId].type === "GROUP_LABEL";
            return (
              <React.Fragment key={annotation.id}>
                <Annotation {...annotation} />
                {isGroupLabel && (
                  <Xarrow
                    start={String(labelRelations[annotation.id])}
                    end={annotation.id}
                    endAnchor="middle"
                    headSize={2}
                    headShape="circle"
                    // This curveness 0.01 is used to make the arrow look straight.
                    // we could have used path="straight" property but it gives the
                    // following error - Error: <path> attribute d: Expected number...
                    curveness={0.01}
                  />
                )}
              </React.Fragment>
            );
          })}
        </>
      );
    }
  }
};

const GroupLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf } = props;
  return (
    <HandlerLayer
      pdf={pdf}
      onClick={() => console.log("group layer")}></HandlerLayer>
  );
};

export default GroupLayer;
