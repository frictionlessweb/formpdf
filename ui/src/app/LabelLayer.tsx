/** @jsxImportSource @emotion/react */

import { LabelLayerActionMenu } from "../components/ActionMenu";
import {
  AnnotationBeingCreated,
  TranslucentBox,
  HandlerLayer,
  useCreateAnnotation,
  ResizeHandle,
  useSelectAnnotation,
  AnnotationBeingSelected,
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
  AnnotationId,
} from "./StoreProvider";
import color from "../components/color";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import React from "react";
import { CSSObject } from "@emotion/react";

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
  } = useSelectAnnotation(div, ["LABEL", "GROUP_LABEL"]);

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
        container: createContainer,
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
    }
  }
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

  const [handleDelete, handleUpdateLabel] = [
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
      <>
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
            onMouseDown={(e) => {
              // We stop propagation with the goal of preventing annotation being selected.
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "DESELECT_ALL_ANNOTATION" });
              dispatch({
                type: "SELECT_ANNOTATION",
                payload: [id],
              });
            }}
          />
        </TranslucentBox>
        {isSelected && (
          <LabelLayerActionMenu
            position={{
              top: css.top,
              left: css.left,
            }}
            showDelete={showDelete}
            showCreateOrUpdateLabel={showCreateOrUpdateLabel}
            createOrUpdateLabelText={createOrUpdateLabelText}
            onDelete={handleDelete}
            onUpdateLabel={handleUpdateLabel}
          />
        )}
      </>
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
      ? `${
          annotations[labelRelations[groupIdForCurrentAnnotation]].customTooltip
        }: `
      : "";
  }

  const fieldLabel = hasRelation
    ? annotations[labelRelations[id]].customTooltip
    : "";
  const customLabel = customTooltip ?? "";

  const tooltipPreview = groupLabel + fieldLabel + customLabel;

  return (
    <>
      <TranslucentBox
        id={id}
        css={{
          cursor: "pointer",
          ...css,
          border: isSelected ? "3px solid black" : css.border,
          zIndex: isSelected ? 100 : 0,
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
              payload: id,
            });
          } else {
            dispatch({
              type: "SELECT_ANNOTATION",
              payload: [id],
            });
          }
        }}
      />
      {previewTooltips && tooltipPreview !== "" && (
        <TooltipPreview forId={id} tooltip={tooltipPreview} />
      )}
      {isFirstSelection && (
        <LabelLayerActionMenu
          position={{
            top: css.top,
            left: css.left,
          }}
          showDelete={showDelete}
          showCreateOrUpdateLabel={showCreateOrUpdateLabel}
          createOrUpdateLabelText={createOrUpdateLabelText}
          onDelete={handleDelete}
          onUpdateLabel={handleUpdateLabel}
        />
      )}
    </>
  );
};

const TooltipPreview: React.FC<{
  forId: AnnotationId;
  tooltip: string;
}> = ({ forId, tooltip }) => {
  const zoom = useSelector((state) => state.zoom);
  const annotations = useSelector((state) => state.annotations);
  const annotation = annotations[forId];

  // we found out this ASPECT_RATIO for Robot manually.
  const ROBOTO_FONT_AVG_HEIGHT_TO_WIDTH_RATIO = 0.55;
  const fontSize = 18 * zoom;
  const tooltipWidth =
    fontSize * ROBOTO_FONT_AVG_HEIGHT_TO_WIDTH_RATIO * tooltip.length;

  const baseTooltipStyle: CSSObject = {
    position: "absolute",
    top: annotation.top,
    left: annotation.left,
    padding: "0.2rem",
    borderRadius: "0.4rem",
    backgroundColor: color.blue.dark,
    color: "white",
    zIndex: 200,

    fontSize: `${fontSize}px`,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    border: `1px solid ${color.white.medium}`,

    transition: "all 0.2s ease-in-out",
  };

  const minimisedTooltipStyle: CSSObject = {
    ...baseTooltipStyle,
    // In minimised state, we want to show only 4/5 of
    // the tooltip or 24px if its really small.
    width: (annotation.width * 4) / 5,
    minWidth: "24px",
    "&:hover": {
      width: "auto",
      // this is important or the hovered tooltip will be hidden by other tooltips.
      zIndex: 210,
    },
  };

  return (
    <div
      css={
        tooltipWidth > annotation.width
          ? minimisedTooltipStyle
          : baseTooltipStyle
      }>
      {tooltip}
    </div>
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

const LabelLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  const layer = useFieldLayer(container);
  const tool = useSelector((state) => state.tool);

  let LabelLayerAnnotations = <></>;
  if (tool === "CREATE") {
    LabelLayerAnnotations = (
      <>
        {layer.creationState && (
          <AnnotationBeingCreated
            creationState={layer.creationState}
            showTokens={false}
          />
        )}
        <AllTokens />
      </>
    );
  }
  if (tool === "SELECT") {
    LabelLayerAnnotations = (
      <>
        {layer.selectionState && (
          <AnnotationBeingSelected selectionState={layer.selectionState} />
        )}
        <SelectAnnotation />
      </>
    );
  }

  return (
    <HandlerLayer
      pdf={pdf}
      onClick={layer.onClick}
      onMouseDown={layer.onMouseDown}
      onMouseLeave={layer.onMouseLeave}
      onMouseMove={layer.onMouseMove}
      onMouseUp={layer.onMouseUp}>
      <ResizeHandle
        pdf={pdf}
        container={container}
        rootCss={{ cursor: layer.cursor }}
      />
      {LabelLayerAnnotations}
    </HandlerLayer>
  );
};

export default LabelLayer;
