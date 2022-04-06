/** @jsxImportSource @emotion/react */
import React from "react";
import { CSSObject } from "@emotion/react";
import {
  Bounds,
  Annotation as AnnotationStatic,
  useDispatch,
  useSelector,
} from "./StoreProvider";
import { FieldLayerActionMenu } from "../components/ActionMenu";
import { Rnd } from "react-rnd";

type TranslucentBoxProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  css: CSSObject;
  nodeRef?: React.MutableRefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
};

export const TranslucentBox: React.FC<TranslucentBoxProps> = (props) => {
  const { css, nodeRef, children, ...divProps } = props;
  return (
    <div
      ref={nodeRef}
      {...divProps}
      css={{
        width: "100%",
        height: "100%",
        // using opacity on this components makes its children transparent, thus it is
        // recommeded to use rgba(0,0,0,0.3) for the background color.
        backgroundColor: props?.css?.backgroundColor,
      }}>
      {children}
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
  // What
  movedLeft: number;
}

export interface CreationState {
  // What are the bounds associated with this token?
  bounds: CreationBounds;
  // What tokens are related to those bounds?
  tokens: Bounds[];
}

export const doOverlap = (boxOne: Bounds, boxTwo: Bounds): boolean => {
  const verticallySeparate =
    boxOne.top >= boxTwo.top + boxTwo.height ||
    boxTwo.top >= boxOne.top + boxOne.height;
  const horizontallySeparate =
    boxOne.left >= boxTwo.left + boxTwo.width ||
    boxTwo.left >= boxOne.left + boxOne.width;
  return !verticallySeparate && !horizontallySeparate;
};

export const filterTokensToDisplay = (
  realBounds: Bounds,
  tokens: Bounds[] | undefined
) => tokens?.filter((token) => doOverlap(token, realBounds)) || [];

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

export const useCreateAnnotation = () => {
  // We need to know the container so that we can figure out where relative
  // in the page we should position the bounds.
  const div = React.useRef<HTMLDivElement | null>(null);
  const allTokens = useSelector(
    (state) => state.tokens && state.tokens[state.page - 1]
  );
  const [creationState, setState] = React.useState<CreationState | null>(null);

  const resetCreationState = () => {
    setState(null);
  };

  const getMovedPositions = (e: React.MouseEvent<Element, MouseEvent>) => {
    if (!div.current) return { movedTop: 0, movedLeft: 0 };
    const movedTop = e.pageY - div.current.offsetTop + div.current.scrollTop;
    const movedLeft = e.pageX - div.current.offsetLeft + div.current.scrollLeft;
    return { movedTop, movedLeft } as const;
  };

  const updateCreationState: React.MouseEventHandler = (e) => {
    setState((prevBounds) => {
      if (prevBounds === null) return null;
      const moved = getMovedPositions(e);
      const newBounds = {
        top: prevBounds.bounds.top,
        left: prevBounds.bounds.left,
        movedTop: moved.movedTop,
        movedLeft: moved.movedLeft,
      };
      const tokens = filterTokensToDisplay(
        mapCreationBoundsToFinalBounds(newBounds),
        allTokens
      );
      return {
        bounds: newBounds,
        tokens,
      };
    });
  };

  const newCreationBounds: React.MouseEventHandler = (e) => {
    const { movedTop, movedLeft } = getMovedPositions(e);
    setState({
      bounds: { top: movedTop, left: movedLeft, movedTop, movedLeft },
      tokens: [],
    });
  };

  return {
    div,
    creationState,
    resetCreationState,
    updateCreationState,
    newCreationBounds,
  } as const;
};

interface AnnotationBeingCreatedProps {
  // What is our current creationState?
  creationState: CreationState | null;
  // What should we do when we press the mouse down?
  onMouseDown: React.MouseEventHandler;
  // What should we do when we unpress the mouse (release a click)?
  onMouseUp: React.MouseEventHandler;
  // What should we do when we move the mouse?
  onMouseMove: React.MouseEventHandler;
}

export const AnnotationBeingCreated: React.FC<AnnotationBeingCreatedProps> = (
  props
) => {
  const { creationState, ...handlers } = props;
  const tokens = useSelector((state) => state.tokens[0]);
  if (!creationState) return null;
  // if (!creationState) {
  //   return (
  //     <>
  //       {tokens.map((token) => (
  //         <TranslucentBox
  //           key={token.top * token.left}
  //           css={{
  //             position: "absolute",
  //             backgroundColor: "rgb(144, 238, 144, 0.3)",
  //             border: "1px solid blue",
  //             top: token.top,
  //             left: token.left,
  //             width: token.width,
  //             height: token.height,
  //           }}
  //           {...handlers}
  //         />
  //       ))}
  //     </>
  //   );
  // }
  const { bounds: creationBounds, tokens: displayTokens } = creationState;
  return (
    // FIXME: TEXTBOX will not be default. We will use the last created field type as current value.
    <>
      <TranslucentBox
        css={{
          position: "absolute",
          backgroundColor: "rgb(144, 238, 144, 0.3)",
          border: "3px solid green",
          ...mapCreationBoundsToCss(creationBounds),
        }}
        {...handlers}
      />
      {displayTokens.map((token) => {
        // These tokens are *not* the child of TranslucentBox because the css
        // position: absolute confuses the math we've done.
        return (
          <TranslucentBox
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
            {...handlers}
          />
        );
      })}
    </>
  );
};

//     _                      _        _   _
//    / \   _ __  _ __   ___ | |_ __ _| |_(_) ___  _ __
//   / _ \ | '_ \| '_ \ / _ \| __/ _` | __| |/ _ \| '_ \
//  / ___ \| | | | | | | (_) | || (_| | |_| | (_) | | | |
// /_/   \_\_| |_|_| |_|\___/ \__\__,_|\__|_|\___/|_| |_|

type AnnotationProps = AnnotationStatic & {
  css?: CSSObject;
};

// For some reason, with React RND, if you don't offset the top and the left
// by *exactly* two pixels, it doesn't look right.
const MYSTERIOUS_RND_OFFSET = 2;

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
        <TranslucentBox nodeRef={ref} css={{ cursor: "inherit", ...css }} />
      );
    }
    case "SELECT": {
      const isSelected = Boolean(selectedAnnotations[props.id]);
      // When multiple selections are made, we want to show action menu on
      // the annotation which was selected first from the set.
      const isFirstSelection = Object.keys(selectedAnnotations)[0] === props.id;
      return (
        <Rnd
          allowAnyClick
          style={{
            position: "absolute",
            border: isSelected ? "3px solid black" : props.border,
            backgroundColor: props.backgroundColor,
          }}
          position={{
            x: props.left + MYSTERIOUS_RND_OFFSET,
            y: props.top + MYSTERIOUS_RND_OFFSET,
          }}
          size={{ height: props.height, width: props.width }}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            const shiftNotPressed = !e.shiftKey;
            if (shiftNotPressed) {
              dispatch({ type: "DESELECT_ALL_ANNOTATION" });
            }
            if (isSelected) {
              dispatch({ type: "DESELECT_ANNOTATION", payload: props.id });
            } else {
              dispatch({ type: "SELECT_ANNOTATION", payload: props.id });
            }
          }}
          css={{
            ...css,
            border: isSelected ? "2px solid black" : css.border,
          }}
          onDragStop={(_, delta) => {
            dispatch({
              type: "MOVE_ANNOTATION",
              payload: {
                id: props.id,
                x: delta.x - MYSTERIOUS_RND_OFFSET,
                y: delta.y - MYSTERIOUS_RND_OFFSET,
              },
            });
          }}
          onResize={(_, __, ref, ___, el) => {
            dispatch({
              type: "RESIZE_ANNOTATION",
              payload: {
                id: props.id,
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: el.x - MYSTERIOUS_RND_OFFSET,
                y: el.y - MYSTERIOUS_RND_OFFSET,
              },
            });
          }}>
          {isFirstSelection && (
            <FieldLayerActionMenu
              onDelete={() => {
                dispatch({
                  type: "DELETE_ANNOTATION",
                  payload: Object.keys(selectedAnnotations),
                });
              }}
              onFieldTypeChange={(value) => {
                dispatch({
                  type: "SET_ANNOTATION_TYPE",
                  payload: {
                    ids: Object.keys(selectedAnnotations),
                    type: value,
                  },
                });
              }}
            />
          )}
        </Rnd>
      );
    }
    default:
      return null;
  }
};

export default Annotation;
