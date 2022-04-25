/** @jsxImportSource @emotion/react */

// HOW TO RENDER THINGS ON TOP OF A PDFUI AS EASILY AS POSSIBLE
// ----------------------------------------------------------
// The basic trick around which our app revolves is that we can render a
// PDFUI document into a canvas and position a div right atop the PDFUI. From
// there, we can render other drag/droppable divs that line up with elements
// on the canvas, adjusting the position/scale accordingly based on the
// zoom level and other factors. We get panning over the PDFUI for free by
// limiting the size of the canvas's container and using overflow: scroll
// in the CSS.

import React from "react";
import {
  getDocument,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
  RenderingCancelledException,
} from "pdfjs-dist";
import Loading from "@mui/material/CircularProgress";
import { useSelector, useDispatch, Step } from "./StoreProvider";
import { useCreateAnnotation, CreationState } from "./Annotation";
import { fieldLayerHandlers, FieldLayerAllAnnotations } from "./FieldLayer";
import {
  labelLayerHandlers,
  LabelLayerAllAnnotationsAndTokens,
} from "./LabelLayer";
import { groupLayerHandlers, GroupLayerAllAnnotations } from "./GroupLayer";

//  _____    _       _     ____     _  __
// |  ___|__| |_ ___| |__ |  _ \ __| |/ _|
// | |_ / _ \ __/ __| '_ \| |_) / _` | |_
// |  _|  __/ || (__| | | |  __/ (_| |  _|
// |_|  \___|\__\___|_| |_|_|   \__,_|_|

// Encapsulate all of the logic for downloading a PDFUI and rendering it onto a
// canvas into a single hook. All we need is the URL of where the PDFUI file
// is located; the code below takes care of the rest.

interface FetchingPdf {
  // Are we still getting the PDFUI?
  loading: boolean;
  // Reference to the Canvas element into which we ultimately display the PDFUI.
  canvas: React.MutableRefObject<HTMLCanvasElement | null>;
}

const useFetchPDFUI = (url: string): FetchingPdf => {
  // Three things need to happen for us to display the PDFUI with pdfjs:
  // 1. We need to download the PDFUI file and get a PDFDocumentProxy object.
  // 2. We need to extract the current page from the PDFDocumentProxy.
  // 3. We need to render the current page to a canvas element.

  // These three steps need to be split into three different useEffect calls
  // so that each one only happens when the relevant state actually changes.
  // One big useEffect where all of the props are in the dependency array would
  // slow down the app considerably and create an undesireable user experience.
  // --------------------------------------------------------------------------

  // Track whether we're about to show a PDFUI; when true, we show a nice spinner,
  // and when false, we show the desired PDFUI file.
  const [loading, setLoading] = React.useState<boolean>(true);

  // Extract some metadata from the Redux store.
  const { zoom, page } = useSelector((state) => ({
    zoom: state.zoom,
    page: state.page,
  }));

  // Step 1: Fetch the document.
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(
    null
  );

  React.useEffect(() => {
    const fetchDocument = async () => {
      const unloadedDocument = getDocument(url);
      const doc = await unloadedDocument.promise;
      // Getting the document happens very quickly during development, but
      // in production it can be slow and potentially lead to a bad user
      // experience. To test the slow path, try adding a delay right here
      // using the function below:
      //
      // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      setPdfDocument(doc);
    };
    fetchDocument();
  }, [url]);

  // Step 2: Set the page.
  const [pageProxy, setPageProxy] = React.useState<PDFPageProxy | null>(null);
  React.useEffect(() => {
    const fetchPage = async () => {
      if (pdfDocument === null) return;
      const thePage = await pdfDocument.getPage(page);
      setPageProxy(thePage);
    };
    fetchPage();
  }, [pdfDocument, page]);

  // Step 3: Render to the canvas.
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const renderingRef = React.useRef<RenderTask | null>(null);
  React.useEffect(() => {
    const displayPdf = async () => {
      try {
        // If the PDFUI or the DOM isn't ready yet, just return and try again later.
        if (!pageProxy) return;
        const canvas = canvasRef?.current;
        if (!canvas) return;
        const canvasContext = canvas.getContext("2d");
        if (!canvasContext) return;

        if (renderingRef.current) {
          // If we're trying to render something else, prevent it from finishing,
          // then continue. This will throw an exception we deliberately choose
          // to ignore below.
          renderingRef.current?.cancel();
        }

        // By default, PDFUIJS will render an extremely blurry PDFUI, so we need to set
        // the viewport correctly in order to avoid an unpleasant user experience.
        const scale = window.devicePixelRatio || 1;
        const viewport = pageProxy.getViewport({ scale: zoom * scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        renderingRef.current = pageProxy.render({ viewport, canvasContext });
        await renderingRef.current.promise;
      } catch (err) {
        if (!(err instanceof RenderingCancelledException)) {
          // An error that we didn't expect happened; throw it.
          throw err;
        }
      } finally {
        // Now that we've triggered a render, we've fetched everything we've needed
        // to from the network, so we can set loading to false again. Other PDFUI
        // operations are generally fast enough that we don't need to display a
        // spinner.
        setLoading(false);
      }
    };
    displayPdf();
  }, [pageProxy, canvasRef, renderingRef, zoom]);
  return { loading, canvas: canvasRef };
};

//  ____                          _   _                 _ _
// / ___|__ _ _ ____   ____ _ ___| | | | __ _ _ __   __| | | ___ _ __ ___
//| |   / _` | '_ \ \ / / _` / __| |_| |/ _` | '_ \ / _` | |/ _ \ '__/ __|
//| |__| (_| | | | \ V / (_| \__ \  _  | (_| | | | | (_| | |  __/ |  \__ \
// \____\__,_|_| |_|\_/ \__,_|___/_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/

// Depending on the tool that we've selected, mousing over the Canvas needs
// to have different behavior. We configure the right thing for each tool
// here.
//
// Note that if you want to change the behavior for an annotation, this is
// *not* the right place to put that logic. Instead, take a look at the
// Annotation component and the handlers that we've placed there.

interface Handlers {
  // What is the containing div?
  container: React.MutableRefObject<HTMLDivElement | null>;
  // What shape should the cursor be?
  cursor: string;
  // Are we in the middle of highlighting something? If so, what is it?
  creationState: null | CreationState;
  // What should we do when our mouse is clicked over a region in the container div?
  onClick: React.MouseEventHandler;
  // What should we do when our mouse moves over a region of the Canvas?
  onMouseUp: React.MouseEventHandler;
  // What should we do when we click down on the Canvas?
  onMouseDown: React.MouseEventHandler;
  // What should we do when our mouse moves on the canvas?
  onMouseMove: React.MouseEventHandler;
  // What should we do when our mouse leaves the canvas?
  onMouseLeave: React.MouseEventHandler;
}

export const NO_OP: React.MouseEventHandler = () => {};

export interface CreateAnnotationAttr {
  div: React.MutableRefObject<HTMLDivElement | null>;
  creationState: null | CreationState;
  newCreationBounds: React.MouseEventHandler;
  resetCreationState: () => void;
  updateCreationState: React.MouseEventHandler;
}

const useHandlers = (): Handlers => {
  const [step, state] = useSelector((state) => [state.step, state]);
  const dispatch = useDispatch();
  const createAnnotationAttr = useCreateAnnotation();
  const { creationState, div: container } = createAnnotationAttr;
  switch (step) {
    case "FIELD_LAYER":
      return fieldLayerHandlers(state, dispatch, createAnnotationAttr);
    case "LABEL_LAYER":
      return labelLayerHandlers(state, dispatch, createAnnotationAttr);
    case "SECTION_LAYER":
      return groupLayerHandlers(state, dispatch, createAnnotationAttr);
    default:
      return {
        cursor: "auto",
        creationState,
        container,
        onClick: NO_OP,
        onMouseMove: NO_OP,
        onMouseUp: NO_OP,
        onMouseDown: NO_OP,
        onMouseLeave: NO_OP,
      };
  }
};

//  ____  ____  _____  _   _ ___
// |  _ \|  _ \|  ___ | | | |_ _|
// | |_) | | | | |_   | | | || |
// |  __/| |_| |  _|  | |_| || |
// |_|   |____/|_|     \___/|___|

interface PDFUIProps {
  // Where is the PDFUI located?
  url: string;
  // How wide is the PDFUI?
  width: number;
  // How tall is the PDFUI?
  height: number;
  // Other components to render inside the PDFUI div.
  children?: React.ReactNode;
}

export interface RenderAnnotationsHandler {
  onMouseUp: React.MouseEventHandler;
  // What should we do when we click down on the Canvas?
  onMouseDown: React.MouseEventHandler;
  // What should we do when our mouse moves on the canvas?
  onMouseMove: React.MouseEventHandler;
}

// Actually render the PDFUI onto the screen. Ideally, the code in this component
// should be extremely simple; most of the complicated functionality gets pushed
// to hooks in other places.
const PDFUI: React.FC<PDFUIProps> = (props) => {
  const { url, width, height } = props;
  const { canvas, loading } = useFetchPDFUI(url);
  const step = useSelector((state) => state.step);

  const {
    cursor,
    container,
    creationState,
    onMouseLeave,
    onClick,
    ...handlers
  } = useHandlers();

  return (
    <div
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      ref={container}
      css={{
        border: "2px solid black",
        width: "auto",
        maxHeight: height,
        maxWidth: width,
        overflowY: "scroll",
        overflowX: "scroll",
        position: "relative",
        cursor,
      }}>
      <canvas id="pdf" ref={canvas} {...handlers} />
      {loading ? (
        <Loading
          sx={{
            top: 20,
            left: "48%",
            position: "absolute",
          }}
        />
      ) : (
        <>
          {props.children}
          {renderAnnotation(step, creationState, handlers)}
        </>
      )}
    </div>
  );
};

const renderAnnotation = (
  step: Step,
  creationState: CreationState | null,
  handlers: RenderAnnotationsHandler
) => {
  switch (step) {
    case "FIELD_LAYER": {
      return (
        <FieldLayerAllAnnotations
          creationState={creationState}
          handlers={handlers}
        />
      );
    }
    case "LABEL_LAYER": {
      return (
        <LabelLayerAllAnnotationsAndTokens
          creationState={creationState}
          handlers={handlers}
        />
      );
    }
    case "GROUP_LAYER": {
      return (
        <GroupLayerAllAnnotations
          creationState={creationState}
          handlers={handlers}
        />
      );
    }
    default: {
      return null;
    }
  }
};

const PDF: React.FC<PDFUIProps> = (props) => {
  const { url, width, height } = props;
  return <PDFUI url={url} width={width} height={height} />;
};

export default PDF;
