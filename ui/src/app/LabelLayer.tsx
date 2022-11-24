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
  BackgroundColors,
  Borders,
  Annotation,
} from "./StoreProvider";
import color from "../components/color";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import React from "react";

// Render all of the tokens on the current page. We wrap this in React.memo for a
// substantial performance boost.
export const AllTokens: React.FC = React.memo(() => {
  const allTokens = useSelector((state) => state.tokens);
  let tokens: Array<Bounds> = [];
  allTokens.forEach((list) => {
    tokens = [...tokens, ...list];
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
  const tool = useSelector((state) => state.tool);
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);
  const page = useSelector((state) => state.page);
  const annotations = useSelector((state) => state.annotations);

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
          const selectedGroups = Object.keys(selectedAnnotations).filter(
            (annotationId) => annotations[annotationId].type === "GROUP"
          );
          const selectedFields = Object.keys(selectedAnnotations).filter(
            (annotationId) => annotations[annotationId].type !== "GROUP"
          );
          if (selectedGroups.length > 0) {
            dispatch({
              type: "CREATE_LABEL",
              payload: {
                to: {
                  ui: {
                    id,
                    backgroundColor: BackgroundColors["GROUP_LABEL"],
                    border: Borders["GROUP_LABEL"],
                    borderRadius: 50,
                    type: "GROUP_LABEL",
                    page,
                    corrected: true,
                  },
                  tokens: creationState.tokens,
                },
                from: selectedGroups,
              },
            });
          }

          if (selectedFields.length > 0) {
            dispatch({
              type: "CREATE_LABEL",
              payload: {
                to: {
                  ui: {
                    id,
                    backgroundColor: BackgroundColors["LABEL"],
                    border: Borders["LABEL"],
                    borderRadius: 50,
                    type: "LABEL" as ANNOTATION_TYPE,
                    page,
                    corrected: true,
                  },
                  tokens: creationState.tokens,
                },
                from: selectedFields,
              },
            });
          }

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

const Label: React.FC<AnnotationStatic> = (props) => {
  const { id, type, children, customTooltip, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };

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
};

const GroupAndField: React.FC<AnnotationStatic> = (props) => {
  // useArrow is used to manually re-renders xarrow.
  // There was a bug where XArrow was not updating its position until clicked on the canvas.
  // using useArrow and XWrapper fixes this issue – https://github.com/Eliav2/react-xarrows#v2-example
  // Whenever the state changes, useArrow will be called and XWrapper will re-render the XArrow.
  useXarrow();
  const selectedAnnotations = useSelector((state) => state.selectedAnnotations);
  const labelRelations = useSelector((state) => state.labelRelations);
  const annotations = useSelector((state) => state.annotations);
  const groupRelations = useSelector((state) => state.groupRelations);
  const previewTooltips = useSelector((state) => state.previewTooltips);
  const zoom = useSelector((state) => state.zoom);

  const dispatch = useDispatch();
  const { id, type, children, customTooltip, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  const hasRelation = Boolean(labelRelations[id]);
  const isSelected = Boolean(selectedAnnotations[id]);
  const isFirstSelection = Object.keys(selectedAnnotations)[0] === id;

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

  const [handleCustomTooltipChange, handleDelete, handleUpdateLabel] = [
    (value: string) => {
      dispatch({
        type: "CHANGE_CUSTOM_TOOLTIP",
        payload: {
          id,
          customTooltip: value,
        },
      });
    },
    () => {
      dispatch({
        type: "DELETE_LABEL",
        payload: Object.keys(selectedAnnotations),
      });
    },
    () => {
      dispatch({
        type: "CHANGE_TOOL",
        payload: "CREATE",
      });
    },
  ];

  if (type === "GROUP") {
    return (
      <TranslucentBox
        id={id}
        css={{
          ...css,
          pointerEvents: "none",
          border: isSelected ? "3px solid black" : css.border,
          zIndex: isSelected ? 100 : 0,
        }}>
        <div
          style={{
            // we have to give pointerEvents auto here because we have pointerEvents none on parent.
            pointerEvents: "auto",
            position: "absolute",
            top: "-10px",
            left: "-10px",
            cursor: "pointer",
            width: "20px",
            height: "20px",
            backgroundColor: "brown",
          }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: "DESELECT_ALL_ANNOTATION" });
            dispatch({
              type: "SELECT_ANNOTATION",
              payload: id,
            });
          }}
        />
        {isSelected && (
          <div
            style={{
              pointerEvents: "auto",
            }}>
            <LabelLayerActionMenu
              showDelete={showDelete}
              showCreateOrUpdateLabel={showCreateOrUpdateLabel}
              createOrUpdateLabelText={createOrUpdateLabelText}
              // We don't shown customtooltip option for group.
              showAdditionalTooltip={false}
              customTooltip={customTooltip}
              onCustomTooltipChange={() => {}}
              onDelete={handleDelete}
              onUpdateLabel={handleUpdateLabel}
            />
          </div>
        )}
      </TranslucentBox>
    );
  }

  let groupIdForCurrentAnnotation = null;
  Object.keys(groupRelations).forEach((groupId) => {
    if (groupRelations[groupId].includes(id)) {
      groupIdForCurrentAnnotation = groupId;
    }
  });
  let groupLabel = "";

  if (groupIdForCurrentAnnotation) {
    const isGroupLabeled = Boolean(labelRelations[groupIdForCurrentAnnotation]);
    groupLabel = isGroupLabeled
      ? annotations[labelRelations[groupIdForCurrentAnnotation]].customTooltip
      : "";
  }

  const fieldLabel = hasRelation
    ? annotations[labelRelations[id]].customTooltip
    : "";
  const customLabel = customTooltip ?? "";

  const tooltipPreview = groupLabel + fieldLabel + customLabel;

  return (
    <>
      {previewTooltips && tooltipPreview !== "" && (
        <span
          style={{
            position: "absolute",
            top: css.top,
            left: css.left,
            fontSize: `${0.8 * zoom}rem`,
            backgroundColor: color.blue.dark,
            color: "white",
            borderRadius: "0.4rem",
            padding: "0.2rem",
            whiteSpace: "nowrap",
            zIndex: 200,
          }}>
          {tooltipPreview}
        </span>
      )}
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
            onCustomTooltipChange={handleCustomTooltipChange}
            onDelete={handleDelete}
            onUpdateLabel={handleUpdateLabel}
          />
        )}
      </TranslucentBox>
    </>
  );
};

interface RelationshipLinkProps {
  id: string;
}

export const RelationshipLink: React.FC<RelationshipLinkProps> = (props) => {
  const { id } = props;
  const labelRelations = useSelector((state) => state.labelRelations);
  const relationship = labelRelations[id];
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
  const annotationsMap = useSelector((state) => state.annotations);
  const annotations = Object.values(annotationsMap);
  const AnnotationComponents = (annotation: Annotation) => {
    if (annotation.type === "LABEL" || annotation.type === "GROUP_LABEL") {
      return <Label {...annotation} />;
    } else {
      return <GroupAndField {...annotation} />;
    }
  };
  return (
    <Xwrapper>
      {annotations.map((annotation) => {
        return (
          <React.Fragment key={annotation.id}>
            {AnnotationComponents(annotation)}
            <RelationshipLink id={annotation.id} />
          </React.Fragment>
        );
      })}
    </Xwrapper>
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
