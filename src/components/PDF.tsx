import React from "react";

interface PDFProps {
  // Where is the PDF located?
  url: string;
  // How scaled in are we, as a percentage?
  zoom: number;
}

const PDF: React.FC<PDFProps> = () => {
  return <div />;
};

export default PDF;
