/** @jsxImportSource @emotion/react */

// HOW TO RENDER THINGS ON TOP OF A PDF AS EASILY AS POSSIBLE
// ----------------------------------------------------------
// The basic trick around which our app revolves is that we can render a
// PDF document into a canvas and position a div right atop the PDF. From
// there, we can render other drag/droppable divs that line up with elements
// on the canvas, adjusting the position/scale accordingly based on the
// zoom level and other factors. We get panning over the PDF for free by
// limiting the size of the canvas's container and using overflow: scroll
// in the CSS.

import React from "react";
import {
  getDocument,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";
import Loading from "@mui/material/CircularProgress";
import { useSelector, useDispatch, Bounds } from "./AccessibleForm";
import Annotation from "./Annotation";

interface PDFProps {
  // Where is the PDF located?
  url: string;
  // How wide is the PDF?
  width: number;
  // How tall is the PDF?
  height: number;
  // Other components to render inside the PDF div.
  children?: React.ReactNode;
}

//  _____    _       _     ____     _  __
// |  ___|__| |_ ___| |__ |  _ \ __| |/ _|
// | |_ / _ \ __/ __| '_ \| |_) / _` | |_
// |  _|  __/ || (__| | | |  __/ (_| |  _|
// |_|  \___|\__\___|_| |_|_|   \__,_|_|

// Encapsulate all of the logic for downloading a PDF and rendering it onto a
// canvas into a single hook. All we need is the URL of where the PDF file
// is located; the code below takes care of the rest.

interface FetchingPdf {
  // Are we still getting the PDF?
  loading: boolean;
  // Reference to the Canvas element into which we ultimately display the PDF.
  canvas: React.MutableRefObject<HTMLCanvasElement | null>;
}

const useFetchPDF = (url: string): FetchingPdf => {
  // Three things need to happen for us to display the PDF with pdfjs:
  // 1. We need to download the PDF file and get a PDFDocumentProxy object.
  // 2. We need to extract the current page from the PDFDocumentProxy.
  // 3. We need to render the current page to a canvas element.

  // These three steps need to be split into three different useEffect calls
  // so that each one only happens when the relevant state actually changes.
  // One big useEffect where all of the props are in the dependency array would
  // slow down the app considerably and create an undesireable user experience.
  // --------------------------------------------------------------------------

  // Track whether we're about to show a PDF; when true, we show a nice spinner,
  // and when false, we show the desired PDF file.
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
      // If the PDF or the DOM isn't ready yet, just return and try again later.
      if (!pageProxy) return;
      const canvas = canvasRef?.current;
      if (!canvas) return;
      const canvasContext = canvas.getContext("2d");
      if (!canvasContext) return;

      if (renderingRef.current) {
        // If we're trying to render something else, wait for it to finish, and
        // then continue. This is especially nice during development, since it
        // means that we can edit the external state of this component without
        // triggering an error.
        await renderingRef.current?.promise;
      }

      // By default, PDFJS will render an extremely blurry PDF, so we need to set
      // the viewport correctly in order to avoid an unpleasant user experience.
      const scale = window.devicePixelRatio || 1;
      const viewport = pageProxy.getViewport({ scale: zoom * scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderingRef.current = pageProxy.render({ viewport, canvasContext });

      // Now that we've triggered a render, we've fetched everything we've needed
      // to from the network, so we can set loading to false again. Other PDF
      // operations are generally fast enough that we don't need to display a
      // spinner.
      setLoading(false);
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

// When we're creating an annotation, the bounds are special because we
// don't exactly know where the user is ultimately going to put the box
// they draw: We don't know the width/height. All we can calculate is the
// displacement between the origin (y: top, x: left) and where they started
// using left/top.
interface LarvalAnnotationBounds {
  // Where is the top of the annotation?
  top: number;
  // Where is the left of the annotation?
  left: number;
  // How far horizontally have we displaced the annotation?
  right: number;
  // How far from the bottom have we displaced the annotation?
  bottom: number;
}

interface CanvasHandlers {
  // What is the containing div?
  container: React.MutableRefObject<HTMLDivElement | null>;
  // What shape should the cursor be?
  cursor: string;
  // Are we in the middle of highlighting something? If so, what is it?
  creationBounds: null | LarvalAnnotationBounds;
  // What should we do when our mouse moves over a region of the Canvas?
  onMouseUp: React.MouseEventHandler<HTMLCanvasElement>;
  // What should we do when we click down on the Canvas?
  onMouseDown: React.MouseEventHandler<HTMLCanvasElement>;
  // What should we do when our mouse moves on the canvas?
  onMouseMove: React.MouseEventHandler<HTMLCanvasElement>;
}

const LarvalAnnotation = () => {};

const useCanvasHandlers = (): CanvasHandlers => {
  const tool = useSelector((state) => state.tool);
  const container = React.useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const [creationBounds, setBounds] =
    React.useState<LarvalAnnotationBounds | null>(null);
  switch (tool) {
    case "CREATE": {
      return {
        cursor: "crosshair",
        creationBounds,
        container,
        onMouseDown: (e) => {
          if (!creationBounds && container.current) {
            const top = e.pageY - container.current.offsetTop;
            const left = e.pageX - container.current.offsetLeft;
            setBounds({ top, left, bottom: top, right: left });
          }
        },
        onMouseMove: (e) => {
          setBounds((prevBounds) => {
            if (!prevBounds || !container.current) return null;
            const bottom = e.pageY - container.current.offsetTop;
            const right = e.pageX - container.current.offsetLeft;
            return { ...prevBounds, right, bottom };
          });
        },
        onMouseUp: (_) => {
          setBounds(null);
        },
      };
    }
    default:
      return {
        cursor: "auto",
        creationBounds: null,
        container,
        onMouseMove: (_) => {},
        onMouseUp: (_) => {},
        onMouseDown: (_) => {},
      };
  }
};

//  ____  ____  _____
// |  _ \|  _ \|  ___|
// | |_) | | | | |_
// |  __/| |_| |  _|
// |_|   |____/|_|

// Actually render the PDF onto the screen. Ideally, the code in this component
// should be extremely simple; most of the complicated functionality gets pushed
// to hooks in other places. 🎉
const PDF: React.FC<PDFProps> = (props) => {
  const { url, width, height, children } = props;
  const { canvas, loading } = useFetchPDF(url);
  const { cursor, container, creationBounds, ...handlers } =
    useCanvasHandlers();
  return (
    <div
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
          {creationBounds ? <h1>Write me</h1> : null}
          {children}
        </>
      )}
    </div>
  );
};

export default PDF;
