# Code Walkthrough

In this document, we provide a higher-level guide to the structure of the code in this program. It aims to be accessible for anyone with a background in React and a guide for other developers who need to build annotation systems for separate projects.

## The PDF and the Canvas

Our central technique involves rendering the PDF document onto a `canvas` with `position: absolute` and putting a sequence of `div`s on top of it. These `div`s have event handlers that register user interactions and handle the business-logic. A visual representation is as follows:

<p align="center">
  <img src="./visualized.png"></img>
</p>

We use [PDF.js](https://mozilla.github.io/pdf.js/) to handle rendering the PDF. For information about how our integration works, see the source code in `src/app/PDF.tsx`, which contains comments with documentation.

## Annotations

An annotation is a `div` that we render according to some positional information. To handle resizing the div and its children dynamically, we use [React RND](https://www.npmjs.com/package/react-rnd). The information we store about the annotation `div`s has the following shape:

```tsx
{
  // What is the ID of the annotation -- how do we uniquely identify it?
  id: AnnotationId;
  // What is the type of the annotation?
  type: ANNOTATION_TYPE;
  // How far from the top of the canvas should this annotation be?
  top: number;
  // How far from the left of the canvas should this annotation be?
  left: number;
  // How wide is this annotation?
  width: number;
  // How tall is this annotation?
  height: number;
}
```

Where `ANNOTATION_TYPE` is one of the following few strings:

```tsx
type ANNOTATION_TYPE =
  | "TEXTBOX"
  | "RADIOBOX"
  | "CHECKBOX"
  | "LABEL"
  | "GROUP"
  | "GROUP_LABEL";
```

These annotations are then rendered onto the document as is.

The first time we render the annotations, we have to **scale the positions according to the pixel density of the device.** Without this step, the annotations generated may look incorrect.

## Labels/Groups

On one level, a label or a group is also a box drawn to the screen, so we also store their positional information with the other annotations. However, we also keep track of the relational information as well.

A label is `one-to-one` with other annotations, so we store a map of `labelId` to `annotationId` values. Conversely, a group is `one-to-many` with other annotations, so we store the group ID beside an array of the annotations which belong to it. The shape of these types are as follows:

```tsx
// How are field and labels related to each other?
labelRelations: Record<AnnotationId, AnnotationId>;
// Which set of fields form a group together?
groupRelations: Record<AnnotationId, Array<AnnotationId>>;
```

## Slider

We have a slider to segment different parts of the form from one another. We implemented this functionality as one div atop another div in much the same way the other annotations work.

## State Management

Our application uses Redux to manage the state of the various annotations, labels, and groups discussed above. However, this choice is an implementation detail; one could use these data structures and techniques using any state API, including React context, recoil, or traditional prop drilling.

## API

We have an extremely small python API in the `api` folder that relies on [fastapi](https://fastapi.tiangolo.com). One could potentially incorporate a machine learning into the `/annotations` route by changing what bounding boxes the model returns.
