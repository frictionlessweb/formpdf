/** @jsxImportSource @emotion/react */
import React from "react";
import { CSSObject } from "@emotion/react";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import {
  Annotation as AnnotationStatic,
  AnnotationUIState,
} from "./AccessibleForm";

type AnnotationProps = AnnotationStatic & AnnotationUIState & { zoom: number };

export const makeContainerStyles = (props: AnnotationProps): CSSObject => {
  const { width, height, top, left, draggable } = props;
  return {
    position: "absolute",
    top,
    left,
    width,
    height,
    zIndex: 1,
    cursor: draggable ? "move" : "inherit",
    overflow: "auto",
  };
};

const Annotation: React.FC<AnnotationProps> = (props) => {
  const { backgroundColor, draggable, resizable, width, height } = props;
  const ref = React.useRef<HTMLDivElement | null>(null);

  const core = (
    <div css={makeContainerStyles(props)} ref={ref}>
      <div
        css={{
          width: "100%",
          height: "100%",
          backgroundColor,
          opacity: 0.33,
        }}
      />
    </div>
  );

  if (draggable) {
    return (
      <Draggable
        nodeRef={ref}
        bounds={{
          top: 0,
          left: 0,
        }}>
        {core}
      </Draggable>
    );
  }

  if (resizable) {
    return (
      <Resizable
        resizeHandles={["se"]}
        axis="both"
        width={width}
        height={height}>
        {core}
      </Resizable>
    );
  }

  return core;
};

export default Annotation;
