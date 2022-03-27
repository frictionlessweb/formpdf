/** @jsxImportSource @emotion/react */
import React from "react";
import { CSSObject } from "@emotion/react";
import {
  Bounds,
  Annotation as AnnotationStatic,
  useDispatch,
  useSelector,
  FIELD_TYPE,
} from "./AccessibleForm";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import { FieldLayerActionMenu } from "../components/ActionMenu";

type TranslucentBoxProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  type: FIELD_TYPE;
  css: CSSObject;
  onDelete: () => void;
  onFieldTypeChange: (value: FIELD_TYPE) => void;
  nodeRef?: React.MutableRefObject<HTMLDivElement | null>;
};

// FIXME: Why are we not using default Props instead of using placeholders such as NO_OP.
export const TranslucentBox: React.FC<TranslucentBoxProps> = (props) => {
  const { css, nodeRef, onDelete, onFieldTypeChange, type, ...divProps } =
    props;
  return (
    <div css={css} ref={nodeRef}>
      <div
        {...divProps}
        css={{
          width: "100%",
          height: "100%",
          backgroundColor: props?.css?.backgroundColor,
        }}>
        {type}
        <FieldLayerActionMenu
          onDelete={onDelete}
          onFieldTypeChange={onFieldTypeChange}
        />
      </div>
    </div>
  );
};

//   ____                _   _
//  / ___|_ __ ___  __ _| |_(_) ___  _ __
// | |   | '__/ _ \/ _` | __| |/ _ \| '_ \
// | |___| | |  __/ (_| | |_| | (_) | | | |
//  \____|_|  \___|\__,_|\__|_|\___/|_| |_|

export interface CreationBounds {
  // Where did the user initially place their cursor vertically when they
  // were making this annotation?
  top: number;
  // Where did the user initially place their cursor horizontally when they
  // were  making this annotation?
  left: number;
  // Where is the user's cursor vertically right now?
  movedTop: number;
  // Where is the user's cursor horizontally right now?
  movedLeft: number;
}

export const mapCreationBoundsToCss = (bounds: CreationBounds): CSSObject => {
  const { top, movedTop, left, movedLeft } = bounds;
  // Calculate the distances between the new positions and the original
  // creation point.
  const height = movedTop - top;
  const width = movedLeft - left;

  // When the distances are negative, we have to flip the div 180 degrees,
  // which we can accomplish via a CSS transform.
  const flipY = width < 0 ? -180 : 0;
  const flipX = height < 0 ? -180 : 0;

  return {
    top,
    left,
    width: Math.abs(width),
    height: Math.abs(height),
    transform: `rotateY(${flipY}deg) rotateX(${flipX}deg)`,
    transformOrigin: "top left",
  };
};

export const mapCreationBoundsToFinalBounds = (
  bounds: CreationBounds
): Bounds => {
  const { top, movedTop, left, movedLeft } = bounds;
  // Calculate the final width/height of the div.
  const height = Math.abs(movedTop - top);
  const width = Math.abs(movedLeft - left);
  // Determine the *real* top and left of the div by finding the smaller values.
  const realTop = Math.min(top, movedTop);
  const realLeft = Math.min(left, movedLeft);
  return {
    top: realTop,
    left: realLeft,
    height,
    width,
  };
};

export const useCreationBounds = () => {
  // We need to know the container so that we can figure out where relative
  // in the page we should position the bounds.
  const div = React.useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = React.useState<CreationBounds | null>(null);

  const resetBounds = () => {
    setBounds(null);
  };

  const getMovedPositions = (e: React.MouseEvent<Element, MouseEvent>) => {
    if (!div.current) return { movedTop: 0, movedLeft: 0 };
    const movedTop = e.pageY - div.current.offsetTop + div.current.scrollTop;
    const movedLeft = e.pageX - div.current.offsetLeft + div.current.scrollLeft;
    return { movedTop, movedLeft } as const;
  };

  const updateBounds: React.MouseEventHandler = (e) => {
    setBounds((prevBounds) => {
      if (prevBounds === null) return prevBounds;
      return {
        ...prevBounds,
        ...getMovedPositions(e),
      };
    });
  };

  const createBounds: React.MouseEventHandler = (e) => {
    const { movedTop, movedLeft } = getMovedPositions(e);
    setBounds({ top: movedTop, left: movedLeft, movedTop, movedLeft });
  };

  return { div, bounds, resetBounds, updateBounds, createBounds };
};

//     _                      _        _   _
//    / \   _ __  _ __   ___ | |_ __ _| |_(_) ___  _ __
//   / _ \ | '_ \| '_ \ / _ \| __/ _` | __| |/ _ \| '_ \
//  / ___ \| | | | | | | (_) | || (_| | |_| | (_) | | | |
// /_/   \_\_| |_|_| |_|\___/ \__\__,_|\__|_|\___/|_| |_|

type AnnotationProps = AnnotationStatic & {
  css?: CSSObject;
};

const Annotation: React.FC<AnnotationProps> = (props) => {
  const [tool, selectedAnnotations] = useSelector((state) => [
    state.tool,
    state.selectedAnnotations,
  ]);
  const dispatch = useDispatch();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { id, type, children: _, ...cssProps } = props;
  const css = {
    ...cssProps,
    position: "absolute" as const,
  };
  switch (tool) {
    case "CREATE": {
      return (
        <TranslucentBox
          onDelete={() => {
            dispatch({ type: "DELETE_ANNOTATION", payload: props.id });
          }}
          onFieldTypeChange={(value) => {
            dispatch({
              type: "SET_ANNOTATION_TYPE",
              payload: { id: props.id, type: value },
            });
          }}
          type={type}
          nodeRef={ref}
          css={{ cursor: "inherit", ...css }}
        />
      );
    }
    case "SELECT": {
      const isSelected = Boolean(selectedAnnotations[props.id]);
      return (
        <TranslucentBox
          onDelete={() => {}}
          onFieldTypeChange={() => {}}
          type={type}
          nodeRef={ref}
          onClick={(e) => {
            if (isSelected) {
              dispatch({ type: "DESELECT_ANNOTATION", payload: props.id });
            } else {
              dispatch({ type: "SELECT_ANNOTATION", payload: props.id });
            }
            e.stopPropagation();
          }}
          css={{
            ...css,
            border: isSelected ? "2px solid black" : css.border,
          }}
        />
      );
    }
    case "DELETE": {
      return (
        <TranslucentBox
          onDelete={() => {}}
          onFieldTypeChange={() => {}}
          type={type}
          nodeRef={ref}
          onClick={() => {
            dispatch({ type: "DELETE_ANNOTATION", payload: props.id });
          }}
          css={{ cursor: "not-allowed", ...css }}
        />
      );
    }
    case "MOVE": {
      return (
        <Draggable
          nodeRef={ref}
          // This tells react-draggable to treat the place we start at as the
          // origin.
          position={{ x: 0, y: 0 }}
          onStop={(_, data) => {
            dispatch({
              type: "MOVE_ANNOTATION",
              payload: {
                id,
                x: data.x,
                y: data.y,
              },
            });
          }}>
          <TranslucentBox
            onDelete={() => {}}
            onFieldTypeChange={() => {}}
            type={type}
            nodeRef={ref}
            css={{ cursor: "move", ...css }}
          />
        </Draggable>
      );
    }
    case "RESIZE": {
      return (
        <Resizable
          width={props.width}
          height={props.height}
          onResize={(_, data) => {
            dispatch({
              type: "RESIZE_ANNOTATION",
              payload: {
                id: props.id,
                width: data.size.width,
                height: data.size.height,
              },
            });
          }}>
          <TranslucentBox
            onDelete={() => {}}
            onFieldTypeChange={() => {}}
            type={type}
            nodeRef={ref}
            css={{ cursor: "resize-nswe", ...css }}
          />
        </Resizable>
      );
    }
  }
};

export default Annotation;
