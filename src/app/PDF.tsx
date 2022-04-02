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
import { useSelector, useDispatch } from "./AccessibleForm";
import Annotation, {
  mapCreationBoundsToFinalBounds,
  useCreationBounds,
  CreationBounds,
  AnnotationBeingCreated,
} from "./Annotation";

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
  creationBounds: null | CreationBounds;
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

const NO_OP: React.MouseEventHandler = () => {};

const useHandlers = (): Handlers => {
  const tool = useSelector((state) => state.tool);
  const dispatch = useDispatch();
  const {
    div: container,
    bounds: creationBounds,
    createBounds,
    resetBounds,
    updateBounds,
  } = useCreationBounds();
  switch (tool) {
    case "CREATE": {
      return {
        cursor: "crosshair",
        creationBounds,
        container,
        onClick: NO_OP,
        onMouseDown: createBounds,
        onMouseMove: updateBounds,
        onMouseLeave: resetBounds,
        onMouseUp: (_) => {
          if (!creationBounds) return;
          dispatch({
            type: "CREATE_ANNOTATION",
            payload: {
              id: window.crypto.randomUUID(),
              backgroundColor: "rgb(255, 182, 193, 0.3)",
              border: "3px solid red",
              type: "TEXTBOX",
              ...mapCreationBoundsToFinalBounds(creationBounds),
            },
          });
          resetBounds();
        },
      };
    }
    case "SELECT": {
      return {
        cursor: "auto",
        creationBounds: null,
        container,
        onMouseMove: NO_OP,
        onMouseUp: NO_OP,
        onMouseDown: NO_OP,
        onMouseLeave: NO_OP,
        onClick: () => {
          if (tool === "SELECT") {
            dispatch({ type: "DESELECT_ALL_ANNOTATION" });
          }
        },
      };
    }
    default:
      return {
        cursor: "auto",
        creationBounds: null,
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

// Actually render the PDFUI onto the screen. Ideally, the code in this component
// should be extremely simple; most of the complicated functionality gets pushed
// to hooks in other places.
const PDFUI: React.FC<PDFUIProps> = (props) => {
  const { url, width, height, children } = props;
  const { canvas, loading } = useFetchPDFUI(url);

  const {
    cursor,
    container,
    creationBounds,
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
          <AnnotationBeingCreated
            creationBounds={creationBounds}
            {...handlers}
          />
          {children}
        </>
      )}
    </div>
  );
};

const PDF: React.FC<PDFUIProps> = (props) => {
  const { url, width, height } = props;
  const annotations = useSelector((state) => Object.values(state.annotations));
  return (
    <PDFUI url={url} width={width} height={height}>
      {annotations.map((annotation) => {
        return <Annotation key={annotation.id} {...annotation} />;
      })}
    </PDFUI>
  );
};

export default PDF;
