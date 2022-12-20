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
import Box from "@mui/material/Box";
import { useSelector, LayerControllerProps } from "./StoreProvider";
import FieldLayer from "./FieldLayer";
import LabelLayer from "./LabelLayer";
import GroupLayer from "./GroupLayer";
import SectionLayer from "./SectionLayer";
import color from "../components/color";

//  _____    _       _     ____     _  __
// |  ___|__| |_ ___| |__ |  _ \ __| |/ _|
// | |_ / _ \ __/ __| '_ \| |_) / _` | |_
// |  _|  __/ || (__| | | |  __/ (_| |  _|
// |_|  \___|\__\___|_| |_|_|   \__,_|_|

// Encapsulate all of the logic for downloading a PDFUI and rendering it onto a
// canvas into a single hook. All we need is the URL of where the PDFUI file
// is located; the code below takes care of the rest.

interface FetchingPdf {
  // Reference to the Canvas element into which we ultimately display the PDFUI.
  canvas: React.MutableRefObject<HTMLCanvasElement | null>;
  image: React.MutableRefObject<HTMLImageElement | null>;
}

interface FetchPDFConfig {
  // Where is the PDF that we want to fetch?
  pdfDocument: PDFDocumentProxy | null;
  // Which page of the PDF do we want to fetch?
  page: number;
}

// Three things need to happen for us to display the PDFUI with pdfjs:
// 1. We need to download the PDFUI file and get a PDFDocumentProxy object.
// 2. We need to extract the current page from the PDFDocumentProxy.
// 3. We need to render the current page to a canvas element.

// These three steps need to be split into three different useEffect calls
// so that each one only happens when the relevant state actually changes.
// One big useEffect where all of the props are in the dependency array would
// slow down the app considerably and create an undesireable user experience.
// --------------------------------------------------------------------------

const usePDFDocumentProxy = (url: string): PDFDocumentProxy | null => {
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

  return pdfDocument;
};

const useFetchPDFUI = (config: FetchPDFConfig): FetchingPdf => {
  const { pdfDocument, page } = config;

  // Extract some metadata from the Redux store.
  const zoom = useSelector((state) => state.zoom);

  // Step 1: Set the page.
  const [pageProxy, setPageProxy] = React.useState<PDFPageProxy | null>(null);
  React.useEffect(() => {
    const fetchPage = async () => {
      if (pdfDocument === null) return;
      const thePage = await pdfDocument.getPage(page);
      setPageProxy(thePage);
    };
    fetchPage();
  }, [pdfDocument, page]);

  // Step 2: Render to the canvas.
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
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
        const image = imageRef?.current;
        if (!image) return;

        if (renderingRef.current) {
          // If we're trying to render something else, prevent it from finishing,
          // then continue. This will throw an exception we deliberately choose
          // to ignore below.
          renderingRef.current?.cancel();
        }

        // By default, PDFUIJS will render an extremely blurry PDF, so we need to set
        // the scale in viewport correctly to define how sharp or blurry will the image look.
        const SCALE = 4;
        const viewport = pageProxy.getViewport({ scale: SCALE });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        renderingRef.current = pageProxy.render({ viewport, canvasContext });
        await renderingRef.current.promise;
        // pdfjs-dist does not support directly rendering to img, so we render image to canvas &
        // then pass the DataURL to an img element on canvas.
        image.src = canvas.toDataURL();
      } catch (err) {
        if (!(err instanceof RenderingCancelledException)) {
          // An error that we didn't expect happened; throw it.
          throw err;
        }
      }
    };
    displayPdf();
  }, [pageProxy, canvasRef, renderingRef, zoom]);
  return { canvas: canvasRef, image: imageRef };
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

export const NO_OP: React.MouseEventHandler = () => {};

//  ____  ____  _____  _   _ ___
// |  _ \|  _ \|  ___ | | | |_ _|
// | |_) | | | | |_   | | | || |
// |  __/| |_| |  _|  | |_| || |
// |_|   |____/|_|     \___/|___|
//
// Render the Canvas onto the screen.

// Since different steps in the application want to handle interactions with
// the PDF differently, we need to give them control over the PDF canvas.
export interface RenderAnnotationsHandler {
  onMouseUp: React.MouseEventHandler;
  // What should we do when we click down on the Canvas?
  onMouseDown: React.MouseEventHandler;
  // What should we do when our mouse moves on the canvas?
  onMouseMove: React.MouseEventHandler;
}

interface PDFProps {
  // Where is the PDFUI located?
  url: string;
}

type PDFUIProps = PDFProps & {
  // What are the children of this PDF?
  children: (props: LayerControllerProps) => React.ReactNode;
};

interface PDFCanvasProps {
  // What page should this component show?
  page: number;
  // Where is the document proxy?
  documentProxy: PDFDocumentProxy | null;
  // What are the children of this component?
  children: (props: LayerControllerProps) => React.ReactNode;
  // What is the container of the surrounding div?
  container: React.MutableRefObject<HTMLDivElement | null>;
  // Zoom level
  zoom: number;
  // height of the PDF image
  pdfHeight: number;
  // width of the PDF image
  pdfWidth: number;
}

const PDFCanvas: React.FC<PDFCanvasProps> = (props) => {
  const { page, documentProxy, children, container, pdfHeight, pdfWidth } =
    props;
  const { canvas, image } = useFetchPDFUI({
    pdfDocument: documentProxy,
    page,
  });

  return (
    <>
      <img
        style={{
          borderBottom: `2px solid ${color.gray.dark}`,
          width: `${pdfWidth}px`,
          height: `${pdfHeight}px`,
        }}
        id={`pdf-img-${page}`}
        ref={image}
        alt={`page ${page} of the pdf`}
      />
      {/* Canvas is hidden and is used only for rendering & generating dataURL for img above */}
      <canvas
        style={{ display: "none" }}
        id={`pdf-canvas-${page}`}
        ref={canvas}
      />
      {/* We only want to have one big handler for all of the events; don't render stuff twice. */}
      {page === 1 ? children({ pdf: canvas, container }) : null}
    </>
  );
};

const PDFUI: React.FC<PDFUIProps> = (props) => {
  const { url, children } = props;
  const pdfDocument = usePDFDocumentProxy(url);
  const pages = useSelector((state) => state.tokens.length);
  const zoom = useSelector((state) => state.zoom);
  const pdfWidth = useSelector((state) => state.pdfWidth);
  const pdfHeight = useSelector((state) => state.pdfHeight);

  const container = React.useRef<HTMLDivElement | null>(null);
  return (
    <div
      id="pdf-container"
      ref={container}
      css={{
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        width: "calc(100vw - 8.4rem)",
        height: "calc(100vh - 4.5rem)",
        position: "relative",
        // Scrollbar styling
        "&::-webkit-scrollbar": {
          width: "10px",
          height: "10px",
        },
        "&::-webkit-scrollbar-track": {},
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: color.gray.lineTransparent,
          outline: "1px solid slategrey",
          borderRadius: "16px",
        },
      }}>
      <>
        {Array.from({ length: pages }).map((_, i) => {
          return (
            <PDFCanvas
              key={`${i + 1}`}
              documentProxy={pdfDocument}
              page={i + 1}
              children={children}
              container={container}
              zoom={zoom}
              pdfHeight={pdfHeight}
              pdfWidth={pdfWidth}
            />
          );
        })}
      </>
    </div>
  );
};

const LayerController: React.FC<LayerControllerProps> = (props) => {
  const step = useSelector((state) => state.step);
  const { container, pdf } = props;
  /**
   * Beware: Tricky edge case! Since the rest of our code supposes we've
   * got a proper reference to the PDF by the time we get here, we can't
   * render any children until canvas.current isn't null.
   */
  if (pdf.current === null) return null;
  switch (step) {
    case "FIELD_LAYER": {
      return <FieldLayer container={container} pdf={pdf} />;
    }
    case "LABEL_LAYER": {
      return <LabelLayer container={container} pdf={pdf} />;
    }
    case "GROUP_LAYER": {
      return <GroupLayer container={container} pdf={pdf} />;
    }
    default: {
      return <SectionLayer container={container} pdf={pdf} />;
    }
  }
};

const LoadingScreen = () => {
  return (
    <Box
      display="flex"
      width="80%"
      justifyContent="center"
      alignItems="center"
      height="60%"
      minHeight="300px">
      <Loading size={100} />
    </Box>
  );
};

const PDF: React.FC<PDFProps> = (props) => {
  const loading = useSelector((state) => state.showLoadingScreen);
  if (loading) return <LoadingScreen />;
  const { url } = props;
  return <PDFUI url={url}>{(props) => <LayerController {...props} />}</PDFUI>;
};

export default PDF;
