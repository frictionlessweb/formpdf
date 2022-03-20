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

interface PDFProps {
  // Where is the PDF located?
  url: string;
  // Which page are we on?
  currentPage: number;
  // How scaled in are we, as a percentage?
  zoom: number;
  // How wide is the PDF?
  width: number;
  // How tall is the PDF?
  height: number;
  // Other components to render inside the PDF div.
  children?: React.ReactNode;
}

/**
 * HOW TO RENDER THINGS ON TOP OF A PDF AS EASILY AS POSSIBLE
 * ----------------------------------------------------------
 */

const PDF: React.FC<PDFProps> = (props) => {
  const { url, currentPage, zoom, width, height, children } = props;

  /**
   * Three things need to happen for us to display the PDF with pdfjs:
   * 1. We need to download the PDF file and get a PDFDocumentProxy object.
   * 2. We need to extract the current page from the PDFDocumentProxy.
   * 3. We need to render the current page to a canvas element.
   *
   * These three steps need to be split into three different useEffect calls
   * so that each one only happens when the relevant state actually changes.
   * One big useEffect where all of the props are in the dependency array would
   * slow down the app considerably and create an undesireable user experience.
   */

  // Step 1: Fetch the document.
  const [pdfDocument, setPdfDocument] = React.useState<PDFDocumentProxy | null>(
    null
  );
  React.useEffect(() => {
    const fetchDocument = async () => {
      const unloadedDocument = getDocument(url);
      const doc = await unloadedDocument.promise;
      setPdfDocument(doc);
    };
    fetchDocument();
  }, [url]);

  // Step 2: Set the page.
  const [page, setPage] = React.useState<PDFPageProxy | null>(null);
  React.useEffect(() => {
    const fetchPage = async () => {
      if (pdfDocument === null) return;
      const thePage = await pdfDocument.getPage(currentPage);
      setPage(thePage);
    };
    fetchPage();
  }, [pdfDocument, currentPage]);

  // Step 3: Render to the canvas.
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const renderingRef = React.useRef<RenderTask | null>(null);
  React.useEffect(() => {
    const displayPdf = async () => {
      // If the PDF or the DOM isn't ready yet, just return and try again later.
      if (!page) return;
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
      const viewport = page.getViewport({ scale: zoom * scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      renderingRef.current = page.render({ viewport, canvasContext });
    };
    displayPdf();
  }, [page, canvasRef, renderingRef, width, height, zoom]);

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
      }}>
      <canvas ref={canvasRef} id="pdf" />
      {children}
    </div>
  );
};

export default PDF;
