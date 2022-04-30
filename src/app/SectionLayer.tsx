/** @jsxImportSource @emotion/react */
import React from "react";
import { useCreateAnnotation, HandlerLayer, ResizeHandle } from "./Annotation";
import { NO_OP } from "./PDF";
import {
  useSelector,
  useDispatch,
  LayerControllerProps,
} from "./StoreProvider";

const SectionLayer: React.FC<LayerControllerProps> = (props) => {
  const { pdf, container } = props;
  return (
    <HandlerLayer pdf={pdf}>
      <ResizeHandle pdf={pdf} height={300} container={container} />
    </HandlerLayer>
  );
};

export default SectionLayer;
