/** @jsxImportSource @emotion/react */

import { LabelLayerActionMenu } from "../components/ActionMenu";
import {
  AnnotationBeingCreated,
  CreationState,
  TranslucentBox,
  HandlerLayer,
  useCreateAnnotation,
  ResizeHandle,
} from "./Annotation";
import { NO_OP } from "./PDF";
import {
  useSelector,
  useDispatch,
  LayerControllerProps,
  Annotation as AnnotationStatic,
  ANNOTATION_TYPE,
} from "./StoreProvider";
import Xarrow from "react-xarrows";
import React from "react";

// Render all of the tokens on the current page. We wrap this in React.memo for a
// substantial performance boost.
export const AllTokens: React.FC = React.memo(() => {
  const tokens = useSelector((state) => state.tokens[state.page - 1]);
  return (
    <>
      {tokens.map((token) => (
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

export const useFieldLayer = (
  div: React.MutableRefObject<HTMLDivElement | null>
) => {
  const attr = useCreateAnnotation(div);
  const {
    div: container,
    creationState,
    newCreationBounds,
    resetCreationState,
    updateCreationState,
  } = attr;
  const { tool, selectedAnnotations } = useSelector((state) => {
    return {
      tool: state.tool,
      selectedAnnotations: state.selectedAnnotations,
    };
  });
  const dispatch = useDispatch();
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
          const id = window.crypto.randomUUID();
          dispatch({
            type: "CREATE_LABEL_RELATION",
            payload: {
              to: {
                ui: {
                  id,
                  backgroundColor: "rgb(36, 148, 178, 0.4)",
                  border: "3px solid rgb(36, 148, 178)",
                  type: "LABEL" as ANNOTATION_TYPE,
                },
                tokens: creationState.tokens,
              },
              from: Object.keys(selectedAnnotations)[0],
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

interface CreationProps {
  creationState: CreationState | null;
}

const CreateLink: React.FC<CreationProps> = (props) => {
  const { creationState } = props;
  return (
    <>
      <AnnotationBeingCreated
        creationState={creationState}
        showTokens
        onMouseDown={NO_OP}
        onMouseMove={NO_OP}
        onMouseUp={NO_OP}
      />
      <AllTokens />
    </>
  );
};

export const LabelLayerSelectAnnotation: React.FC<AnnotationStatic> = (
  props
) => {
  const { selectedAnnotations } = useSelector((state) => {
    const selectedAnnotations = state.selectedAnnotations;
    return { selectedAnnotations };
  });
  const dispatch = useDispatch();
  const { id, type, children, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  const isSelected = Boolean(selectedAnnotations[id]);
  const isFirstSelection = Object.keys(selectedAnnotations)[0] === id;
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
            payload: id,
          });
        } else {
          dispatch({
            type: "SELECT_ANNOTATION",
            payload: id,
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
};

interface RelationshipLinkProps {
  id: string;
}

const RelationshipLink: React.FC<RelationshipLinkProps> = (props) => {
  const { id } = props;
  const relationship = useSelector((state) => {
    return state.labelRelations[id];
  });
  if (!relationship) return null;
  return (
    <Xarrow
      start={String(relationship)}
      end={id}
      endAnchor="middle"
      headSize={2}
      headShape="circle"
      // This curveness 0.01 is used to make the arrow look straight.
      // we could have used path="straight" property but it gives the
      // following error - Error: <path> attribute d: Expected number...
      curveness={0.01}
    />
  );
};

const SelectAnnotation: React.FC = () => {
  const annotations = useSelector((state) =>
    Object.values(state.annotations).filter(
      (annotation) =>
        annotation.height + annotation.top < state.sliderPosition.y
    )
  );
  return (
    <>
      {annotations.map((annotation) => {
        return (
          <React.Fragment key={annotation.id}>
            <LabelLayerSelectAnnotation {...annotation} />
            <RelationshipLink id={annotation.id} />
          </React.Fragment>
        );
      })}
    </>
  );
};

const CreateLabelFlow: React.FC<CreationProps> = (props) => {
  const { creationState } = props;
  const tool = useSelector((state) => state.tool);
  switch (tool) {
    case "CREATE": {
      return <CreateLink creationState={creationState} />;
    }
    case "SELECT": {
      return <SelectAnnotation />;
    }
  }
};

const LabelLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const {
    creationState,
    cursor,
    onClick,
    onMouseDown,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
  } = useFieldLayer(container);
  return (
    <HandlerLayer
      pdf={pdf}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}>
      <ResizeHandle pdf={pdf} container={container} rootCss={{ cursor }} />
      <CreateLabelFlow creationState={creationState} />
    </HandlerLayer>
  );
};

export default LabelLayer;
