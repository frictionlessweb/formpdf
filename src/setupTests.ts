// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// @ts-ignore
window.crypto = {
  randomUUID: jest.fn(() => {
    // This is our mock implementation of crypto.uuid which returns a random value
    // each time uuid is called. This is a very simple implementation of uuid and
    // doesn't follow uuid specification which generates a unique value for each
    // call.
    return Math.random().toString();
  }),
};
