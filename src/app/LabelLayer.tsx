/** @jsxImportSource @emotion/react */

// This file contains code related to the label step. Earlier, we had
// code related to each step spread across multiple files, the reason
// was that we architected the intial technical spike around tools.
// Now, we have a single file for each step. Eventhough we have a lot
// of repetitive code because of this change, eventually, we will
// refactor and fix it.
import { Dispatch } from "redux";
import { LabelLayerActionMenu } from "../components/ActionMenu";
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
  Bounds,
  LayerControllerProps,
} from "./StoreProvider";
import Xarrow from "react-xarrows";
import React from "react";

const useLabelHandlers = () => {
  const { tool, selectedAnnotations } = useSelector((state) => ({
    tool: state.tool,
    selectedAnnotations: state.selectedAnnotations,
  }));
};

export const labelLayerHandlers = (
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
                type: "LABEL",
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

export const LabelLayerAnnotation: React.FC<{
  annotationProps: AnnotationProps;
  annotationRef: React.MutableRefObject<HTMLDivElement | null> | undefined;
}> = ({ annotationProps, annotationRef }) => {
  const [tool, selectedAnnotations] = useSelector((state) => [
    state.tool,
    state.selectedAnnotations,
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
            <LabelLayerActionMenu
              totalSelections={Object.keys(selectedAnnotations).length}
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

export const LabelLayerAllAnnotationsAndTokens: React.FC<{
  creationState: CreationState | null;
  handlers: RenderAnnotationsHandler;
}> = ({ creationState, handlers }) => {
  const [annotations, tool, allTokens, labelRelations] = useSelector(
    (state) => [
      Object.values(state.annotations),
      state.tool,
      state.tokens,
      state.labelRelations,
    ]
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
          {annotations.map((annotation) => {
            const hasRelation = Boolean(labelRelations[annotation.id]);
            return (
              <React.Fragment key={annotation.id}>
                <Annotation {...annotation} />
                {hasRelation && (
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

// While annotationBeingCreated creation state changes, which causes LabelLayerAllAnnotationsAndTokens's to rerender.
// Thus rerendering all tokens on the page even though they remain unchanged. React.Memo is used to avoid this re-rendering.
// The rendering was causing performance issues.
export const AllTokens: React.FC<{ tokens: Bounds[] }> = React.memo((props) => {
  return (
    <>
      {props.tokens.map((token) => (
        <TranslucentBox
          id={`token-${token.top}-${token.left}`}
          key={token.top * token.left}
          css={{
            position: "absolute",
            backgroundColor: "rgb(144, 238, 144, 0.3)",
            border: "1px solid blue",
            top: token.top,
            left: token.left,
            width: token.width,
            height: token.height,
          }}
        />
      ))}
    </>
  );
});

export const LabelLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf } = props;
  return <HandlerLayer pdf={pdf} onClick={() => console.log("label layer")} />;
};

export default LabelLayer;
