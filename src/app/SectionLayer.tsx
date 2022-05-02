/** @jsxImportSource @emotion/react */
import React from "react";
import { HandlerLayer, ResizeHandle } from "./Annotation";
import { LayerControllerProps } from "./StoreProvider";

const SectionLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  return (
    <HandlerLayer pdf={pdf}>
      <ResizeHandle pdf={pdf} container={container} />
    </HandlerLayer>
  );
};

export default SectionLayer;
