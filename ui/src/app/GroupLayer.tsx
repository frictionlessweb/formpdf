/** @jsxImportSource @emotion/react */

import { GroupLayerActionMenu } from "../components/ActionMenu";
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
import React from "react";
import Xarrow from "react-xarrows";
import { AllTokens } from "./LabelLayer";

const useGroupLayer = (div: React.MutableRefObject<HTMLDivElement | null>) => {
  const attr = useCreateAnnotation(div);
  const {
    div: container,
    creationState,
    newCreationBounds,
    resetCreationState,
    updateCreationState,
  } = attr;
  const dispatch = useDispatch();
  const { tool, selectedAnnotations, page } = useSelector((state) => {
    const tool = state.tool;
    const selectedAnnotations = state.selectedAnnotations;
    return {
      tool,
      selectedAnnotations,
      page: state.page,
    };
  });
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
                  type: "GROUP_LABEL" as ANNOTATION_TYPE,
                  page,
                  corrected: true,
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
          dispatch({ type: "DESELECT_ALL_ANNOTATION" });
        },
      };
    }
  }
};

interface HasCreationState {
  creationState: CreationState | null;
}

const GroupLayerCreation: React.FC<HasCreationState> = (props) => {
  const { creationState } = props;
  return (
    <>
      <AnnotationBeingCreated
        creationState={creationState}
        showTokens={true}
        onMouseUp={NO_OP}
        onMouseDown={NO_OP}
        onMouseMove={NO_OP}
      />
      <AllTokens />
    </>
  );
};

const shouldBeGrouped = (annotation: AnnotationStatic): boolean => {
  return (
    annotation.type === "CHECKBOX" ||
    annotation.type === "RADIOBOX" ||
    annotation.type === "GROUP" ||
    annotation.type === "GROUP_LABEL"
  );
};

const GroupLayerSelectAnnotation: React.FC<AnnotationStatic> = (
  annotationProps
) => {
  const [selectedAnnotations, annotations] = useSelector((state) => [
    state.selectedAnnotations,
    state.annotations,
  ]);
  const dispatch = useDispatch();
  const { id, children, type, ...css } = annotationProps;
  const isSelected = Boolean(selectedAnnotations[annotationProps.id]);
  const isFirstSelection =
    Object.keys(selectedAnnotations)[0] === annotationProps.id;
  return (
    <TranslucentBox
      id={id}
      css={{
        cursor: "pointer",
        ...css,
        position: "absolute",
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
          type={type}
          onDelete={() => {
            if (type === "GROUP_LABEL") {
              dispatch({
                type: "DELETE_GROUP",
                payload: id,
              });
            }
          }}
          onCreateNewGroup={() => {
            const uuid = window.crypto.randomUUID();
            dispatch({
              type: "CREATE_GROUP_RELATION",
              payload: {
                from: {
                  ui: {
                    id: uuid,
                    backgroundColor: "rgb(36, 148, 178, 0.4)",
                    border: "3px solid rgb(36, 148, 178)",
                    type: "GROUP",
                  },
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
    </TranslucentBox>
  );
};

const GroupLayerSelections = () => {
  const { annotationsToGroup, labelRelations, height } = useSelector(
    (state) => {
      const annotations = state.annotations;
      const annotationsToGroup = Object.values(state.annotations).filter(
        shouldBeGrouped
      );
      const labelRelations = state.labelRelations;
      const height = state.sliderPosition.y;
      return { annotations, annotationsToGroup, labelRelations, height };
    }
  );
  return (
    <>
      {annotationsToGroup
        .filter((annotation) => annotation.top + annotation.height < height)
        .map((annotation) => {
          const labelId: string = labelRelations[annotation.id];
          const isGroupLabel = labelId && annotation.type === "GROUP_LABEL";
          return (
            <React.Fragment key={annotation.id}>
              <GroupLayerSelectAnnotation {...annotation} />
              {isGroupLabel && (
                <Xarrow
                  start={annotation.id}
                  end={labelRelations[annotation.id]}
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
};

const GroupLayerGateway: React.FC<HasCreationState> = (props) => {
  const { creationState } = props;
  const tool = useSelector((state) => state.tool);
  switch (tool) {
    case "SELECT": {
      return <GroupLayerSelections />;
    }
    case "CREATE": {
      return <GroupLayerCreation creationState={creationState} />;
    }
  }
};

const GroupLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const {
    creationState,
    onMouseDown,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    cursor,
    onClick,
  } = useGroupLayer(container);
  return (
    <HandlerLayer
      pdf={pdf}
      rootCss={{ cursor }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}>
      <ResizeHandle container={container} pdf={pdf} />
      <GroupLayerGateway creationState={creationState} />
    </HandlerLayer>
  );
};

export default GroupLayer;
