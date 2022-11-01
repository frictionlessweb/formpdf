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
import { AllTokens, RelationshipLink } from "./LabelLayer";
import { useXarrow, Xwrapper } from "react-xarrows";

import color from "../components/color";

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
          // this is step 2, you reach here after CREATE_GROUP_RELATION is run.
          // in CREATE_GROUP_RELATION reducer tool is set to CREATE and
          if (!creationState) return;
          const id = window.crypto.randomUUID();
          dispatch({
            type: "CREATE_LABEL",
            payload: {
              to: {
                ui: {
                  id,
                  backgroundColor: color.teal.transparent,
                  border: `4px solid ${color.teal.medium}`,
                  borderRadius: 50,
                  customTooltip: "",
                  type: "GROUP_LABEL" as ANNOTATION_TYPE,
                  page,
                  corrected: true,
                },
                tokens: creationState.tokens,
              },
              from: Object.keys(selectedAnnotations),
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

const GroupLayerSelectAnnotation: React.FC<AnnotationStatic> = (
  annotationProps
) => {
  // We put XWrapper around our LinkRealationship. useArrow is used to manually re-renders xarrow.
  // There was a bug where XArrow was not updating its position until clicked on the canvas.
  // using useArrow and XWrapper fixes this issue. This issue happened when we removed or moved
  // fields from a group. Now we have put useXarrow inside the groupLayerSelectAnnotation component
  // we know that a particular group annotation is re-rendered, so when its re-rendered we also
  // trigger re-render of the xarrow.
  useXarrow();
  const [selectedAnnotations, annotations, groupRelations, labelRelations] =
    useSelector((state) => [
      state.selectedAnnotations,
      state.annotations,
      state.groupRelations,
      state.labelRelations,
    ]);
  const dispatch = useDispatch();
  const { id, children, type, ...cssProps } = annotationProps;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };

  const isSelected = Boolean(selectedAnnotations[annotationProps.id]);
  const isFirstSelection =
    Object.keys(selectedAnnotations)[0] === annotationProps.id;

  if (type === "GROUP_LABEL" || type === "GROUP") {
    // Render just a normal div that doesn't have interactions.
    return (
      <TranslucentBox
        id={id}
        css={{
          ...css,
          border: css.border,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    );
  }
  return (
    <TranslucentBox
      id={id}
      css={{
        cursor: "pointer",
        ...css,
        position: "absolute",
        zIndex: isSelected ? 100 : 0,
        border: isSelected ? "3px solid black" : css.border,
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
          groupOptions={Object.keys(groupRelations).map((groupId) => {
            return {
              label: annotations[labelRelations[groupId]].customTooltip,
              value: annotations[labelRelations[groupId]].id,
            };
          })}
          currentGroup={"None"}
          onGroupChange={(value) => {
            let groupId = "None";
            Object.keys(labelRelations).forEach((field) => {
              if (labelRelations[field] === value) {
                groupId = field;
              }
            });

            dispatch({
              type: "CHANGE_GROUP",
              payload: {
                annotationIds: Object.keys(selectedAnnotations),
                groupId,
              },
            });
          }}
          type={type}
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
                    backgroundColor: "rgba(0,0,0,0)",
                    border: `4px solid ${color.yellow}`,
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
    </TranslucentBox>
  );
};

const GroupLayerSelections = () => {
  const { annotations } = useSelector((state) => {
    const annotations = Object.values(state.annotations).filter(
      (annotation) => {
        return (
          annotation.type === "CHECKBOX" ||
          annotation.type === "RADIOBOX" ||
          annotation.type === "GROUP" ||
          annotation.type === "GROUP_LABEL"
        );
      }
    );
    const labelRelations = state.labelRelations;
    return { annotations, labelRelations };
  });
  return (
    <>
      {annotations.map((annotation) => {
        return (
          <React.Fragment key={annotation.id}>
            <Xwrapper>
              <GroupLayerSelectAnnotation {...annotation} />
              <RelationshipLink id={annotation.id} />
            </Xwrapper>
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
