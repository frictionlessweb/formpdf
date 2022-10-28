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
  Bounds,
} from "./StoreProvider";
import color from "../components/color";
import Xarrow from "react-xarrows";
import React from "react";

// Render all of the tokens on the current page. We wrap this in React.memo for a
// substantial performance boost.
export const AllTokens: React.FC = React.memo(() => {
  const tokens = useSelector((state) => {
    let finalTokens: Array<Bounds> = [];
    state.tokens.forEach((list) => {
      finalTokens = [...finalTokens, ...list];
    });
    return finalTokens;
  });
  return (
    <>
      {tokens.map((token) => (
        <TranslucentBox
          id={`token-${token.top}-${token.left}`}
          key={`${token.top}-${token.left}`}
          css={{
            position: "absolute",
            backgroundColor: color.blue.transparent,
            border: `1px solid ${color.blue.medium}`,
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
  const { tool, selectedAnnotations, page } = useSelector((state) => {
    return {
      tool: state.tool,
      selectedAnnotations: state.selectedAnnotations,
      page: state.page,
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
            type: "CREATE_LABEL",
            payload: {
              to: {
                ui: {
                  id,
                  backgroundColor: color.teal.transparent,
                  border: `4px solid ${color.teal.medium}`,
                  borderRadius: 50,
                  customTooltip: "",
                  type: "LABEL" as ANNOTATION_TYPE,
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
  const [selectedAnnotations, labelRelations] = useSelector((state) => [
    state.selectedAnnotations,
    state.labelRelations,
  ]);
  const dispatch = useDispatch();
  const { id, type, children, customTooltip, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  const hasRelation = Boolean(labelRelations[id]);
  const isSelected = Boolean(selectedAnnotations[id]);
  const isFirstSelection = Object.keys(selectedAnnotations)[0] === id;
  if (type === "LABEL") {
    // TODO: Refactor this bit.
    // Render just a normal div that doesn't have interactions.
    return (
      <TranslucentBox
        id={id}
        css={{
          ...css,
          border: css.border,
          zIndex: 0,
        }}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          e.stopPropagation();
        }}
      />
    );
  }

  const allSelectedAnnotation = Object.keys(selectedAnnotations);
  const totalSelections = allSelectedAnnotation.length;

  // We have three option to show users – Create, Delete and Additional Tooltip
  // when single is selected: hasRelation or noRelation is same as below only
  let showCreateOrUpdateLabel = true;
  let createOrUpdateLabelText = hasRelation ? "Update Label" : "Create Label";
  let showDelete = hasRelation ? true : false;
  let showAdditionalTooltip = totalSelections === 1 ? true : false;

  // Multiple Selections
  if (totalSelections > 1) {
    // logic to find if allhaverelation, allhavenorelation, or mixed.
    let numberOfSelectionsHaveRelation = 0;
    let numberOfSelectionsHaveNoRelation = 0;
    allSelectedAnnotation.forEach((annotationId) => {
      if (Boolean(labelRelations[annotationId])) {
        numberOfSelectionsHaveRelation += 1;
      } else {
        numberOfSelectionsHaveNoRelation += 1;
      }
    });
    const allhaveRelation =
      numberOfSelectionsHaveRelation > 0 &&
      numberOfSelectionsHaveNoRelation === 0;
    const allhaveNoRelation =
      numberOfSelectionsHaveRelation === 0 &&
      numberOfSelectionsHaveNoRelation > 0;
    const somehaveRelation =
      numberOfSelectionsHaveRelation > 0 &&
      numberOfSelectionsHaveNoRelation > 0;

    //   1. all have Relation: C(update) - Show, D - Show, A - Don't show
    if (allhaveRelation) {
      showCreateOrUpdateLabel = true;
      showDelete = true;
      createOrUpdateLabelText = "Update Label";
    }
    //   2. all no Relation: C(create) - Show, D - Don't show, A - Don't show
    if (allhaveNoRelation) {
      showCreateOrUpdateLabel = true;
      createOrUpdateLabelText = "Create Label";
      showDelete = false;
    }
    //   3. some have Relation, some no Relation: C - Don't Show, D - Don't show, A - Don't show
    if (somehaveRelation) {
      showCreateOrUpdateLabel = false;
      showDelete = false;
    }
  }

  return (
    <TranslucentBox
      id={id}
      css={{
        cursor: "pointer",
        ...css,
        border: isSelected ? "3px solid black" : css.border,
        zIndex: isSelected ? 100 : 0,
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
          showDelete={showDelete}
          showCreateOrUpdateLabel={showCreateOrUpdateLabel}
          createOrUpdateLabelText={createOrUpdateLabelText}
          // Only shown for single selection.
          showAdditionalTooltip={showAdditionalTooltip}
          customTooltip={customTooltip}
          onCustomTooltipChange={(value) => {
            dispatch({
              type: "CHANGE_CUSTOM_TOOLTIP",
              payload: {
                id,
                customTooltip: value,
              },
            });
          }}
          onDelete={() => {
            dispatch({
              type: "DELETE_LABEL",
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
      end={id}
      start={String(relationship)}
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
    Object.values(state.annotations).filter((annotation) => {
      // we don't want to show groups and group labels in this layer.
      return annotation.type !== "GROUP" && annotation.type !== "GROUP_LABEL";
    })
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
