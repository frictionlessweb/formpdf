import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import AccessibleForm from "./app/AccessibleForm";

// Font imports: When we compile the project, React will copy the right files
// out of node_modules and generate an HTML file that links to the fonts.
// Hosting our own fonts improves performance and is slightly easier to manage
// than having to manage script tags in the HTML ourselves.
import "@fontsource/roboto";
// Different browsers have different styling quirks; Material UI can smooth
// these over if we import it at the top level.
import CssBaseline from "@mui/material/CssBaseline";
// The library that we use for resizing divs needs this CSS to be imported, so
// we go ahead and do that here. If the handles mysteriously disappear one day,
// check this line of code.
import "react-resizable/css/styles.css";

// In order to render PDF files, we use FireFox's PDF renderer. Setting it up
// requires configuring a web worker so that it can render PDF documents to a
// canvas on a separate thread; below we include the ritual to make that work.
import { GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <AccessibleForm>
      <App />
    </AccessibleForm>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
