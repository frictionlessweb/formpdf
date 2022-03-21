/** @jsxImportSource @emotion/react */
// Don't delete the comment above! It ensures that the CSS of the container div
// works correctly.
import React from "react";
import {
  getDocument,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
} from "pdfjs-dist";
import Loading from "@mui/material/CircularProgress";
import { useSelector, TOOL } from "./AccessibleForm";

// HOW TO RENDER THINGS ON TOP OF A PDF AS EASILY AS POSSIBLE
// ----------------------------------------------------------
// The basic trick around which our app revolves is that we can render a
// PDF document into a canvas and position a div right atop the PDF. From
// there, we can render other drag/droppable divs that line up with elements
// on the canvas, adjusting the position/scale accordingly based on the
// zoom level and other factors. We get panning over the PDF for free by
// limiting the size of the canvas's container and using overflow: scroll
// in the CSS.

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

// Depending on the particular tool selected, we want the cursor to change,
// so we create a map here. Do *not* put this into the component: We don't
// want it to change every time!
const TOOL_SHAPES: Record<TOOL, string> = {
  CREATE: "crosshair",
  MOVE: "auto",
  RESIZE: "auto",
};

const PDF: React.FC<PDFProps> = (props) => {
  const { url, width, height, children } = props;
  const { zoom, page, tool } = useSelector((state) => ({
    zoom: state.zoom,
    page: state.page,
    tool: state.tool,
  }));

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
  }, [pageProxy, canvasRef, renderingRef, width, height, zoom]);

  return (
    <div
      css={{
        border: "2px solid black",
        width: "auto",
        maxHeight: height,
        maxWidth: width,
        overflowY: "scroll",
        overflowX: "scroll",
        position: "relative",
        cursor: TOOL_SHAPES[tool],
      }}>
      <canvas ref={canvasRef} />
      {loading ? (
        <Loading
          sx={{
            top: 20,
            left: "48%",
            position: "absolute",
          }}
        />
      ) : (
        children
      )}
    </div>
  );
};

export default PDF;
