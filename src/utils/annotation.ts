/**
 * An annotation represents a highlighted rectangle that we display on top
 * of a PDF file: Nothing more, nothing less. Practically, we implement it
 * as a div rendered upon a HTML5 canvas with the help of a couple libraries
 * for resizing and moving it around.
 */

export interface AnnotationStatic {
  // What is the ID of the annotation?
  id: string;
  // The background color of the annotation.
  backgroundColor: string;
  // How tall should this annotation be?
  height: number;
  // How wide should this annotation be?
  width: number;
  // How far from the top should this annotation be?
  top: number;
  // How far from the left should this annotation be?
  left: number;
}

export interface AnnotationControls {
  // Do we have the ability to drag/drop this component?
  draggable: boolean;
  // Do we have the ability to resize this component?
  resizable: boolean;
  // How far zoomed in are we?
  zoom: number;
}
