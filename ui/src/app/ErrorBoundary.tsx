/**
 * As we make changes to the app, we continually update the data model as we
 * better understand the nature of our project better. However, these changes
 * often cause the current app to break with the state that's stored in local
 * storage. To fix this problem, we inject this error boundary at the top level
 * to clean up bad state in the case that an error occurs.
 *
 * TODO: Once we're finished building the application, we can delete this file.
 */

import React from "react";
import { connect as makeConnector } from "react-redux";
import { AccessibleFormAction, DEFAULT_ACCESSIBLE_FORM } from "./StoreProvider";

interface ErrorState {
  hasError: boolean;
  errorsCaught: number;
}

interface ErrorBoundaryProps {
  dispatch: (action: AccessibleFormAction) => void;
  children: React.ReactNode;
}

class ErrorBoundaryBase extends React.Component<
  ErrorBoundaryProps,
  ErrorState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorsCaught: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (this.state.errorsCaught <= 3) {
      window.localStorage.clear();
      this.props.dispatch({
        type: "HYDRATE_STORE",
        payload: DEFAULT_ACCESSIBLE_FORM,
      });
      this.setState((prev: ErrorState) => ({
        ...prev,
        errorsCaught: prev.errorsCaught + 1,
      }));
    } else {
      this.setState((prev: ErrorState) => ({
        ...prev,
        hasError: true,
      }));
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <h1>Something went wrong. Please refresh the page and try again.</h1>
      );
    }
    return this.props.children;
  }
}

const ErrorBoundary = makeConnector(null, (dispatch) => {
  return { dispatch };
})(ErrorBoundaryBase);

export default ErrorBoundary;
