# formpdf

Code for accessible PDF rendering.

## Deploying

Authenticate with Pulumi; then, `cd` into the `infra` folder and run:

```sh
pulumi up
```

## Getting Started

To develop the UI, clone the repository, `cd` into the `ui` folder, and run `npm install`.

To develop the API, clone the repository, `cd` into the `api` folder, and run `pip install -r requirements.txt`. You may want to set up a virtual environment as well.

To perform both actions on Unix, run:

```sh
make setup
```

## Developing

In the UI directory, please run `npm start` to edit your changes live.

In the API directory, you can run `uvicorn api:app --reload` to edit your changes live.

If you want to stream both results from one terminal, you can install the program `concurrently` via:

```sh
npm install -g concurrently
```

Then, in the root of the repository, run:

```sh
make start
```

### Adding PDF Files

Move the PDF into the `public` folder to make it accessible. Then, change the
URL in `app.tsx` to `/pdf-name.pdf`, where "pdf-name" is whatever the file name
of the PDF file is.

### UI Components

Material UI v5 provides us with nice buttons, accordions, and other such goodies. You
can find documentation here: https://mui.com/components/

### Styles

We're using `@emotion/react` to do CSS in JS. That means that when you want to style a
component that _isn't_ from Material UI, you can usually do so inline by editing its
CSS object after including the right magic comment:

```tsx
/** @jsxImportSource @emotion/react */
// The line above is *required!* Otherwise, your styles won't work!

const MyFancyComponent = () => {
  return <div css={{ backgroundColor: "hotpink" }}>Hello!</div>;
};

export default MyFancyComponent;
```

For more information about emotion, see here: https://emotion.sh/docs/introduction

### Adding a New File

Creating a new slice of the UI usually involves a lot of boilerplate: You have
to define a new component, export it, create a test file, and write a little
test to make sure that all of the glue is in place. We can automate all of that
using the basic `newcomp` script.

First, add the `scripts` folder onto your `$PATH` in your shell. Then, `cd` into
the directory you want to add new code and run:

```
newcomp MyComponent
```

That will scaffold a new component for you following best practices automatically.

## Testing

In the UI directory, you can run `npm test` from the command line.

In the api directory, you can run `pytest` from the command line.

To run both tests on unix, run:

```sh
make test
```

### Testing PDF Rendering

Since rendering the PDF involves some fairly complicated logic involving `useEffect`
and friends, you'll need to wrap the renders with `act` and `async/await` like so:

```tsx
import { render, act } from "@testing-library/react";
import App from "./App";

test("Does not crash immediately", async () => {
  await act(async () => {
    render(<App />);
  });
});
```

This will ensure you don't get spurious warnings. (It is also the reason
we disable the testing-library/no-unnecessary-act rule.)

## Bugs/Limitations

### Ugly Empty Divs

In order to get the page layout just right, we have some empty divs throughout
the code base that exist to make sure the layout works just right. For example:

```tsx
const App = () => {
  return (
    <Box display="flex" width="100%">
      <div css={{ width: "150px" }} />
      <MiddleApp />
      <Toolbar />
    </Box>
  );
};
```

Are these divs a problem, and is there a way to get rid of them? I'm not sure
if there's an easier/better way to do the styling.

### Props/Store

```
index.tsx passes StoreProvider to the whole app
    - this line of code in reduceAccessibleForm always runs when a page is refreshed, this is where we get our first state data.
        if (previous === undefined) return DEFAULT_ACCESSIBLE_FORM;
App.tsx uses useSaveState, this hook internally
    - useEffect to fetchState, it runs straight away.
    - useEffect to saveState, it runs on whenever
    state changes in the store.
```
