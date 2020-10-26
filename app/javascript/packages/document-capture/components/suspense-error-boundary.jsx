import React, { Component, Suspense } from 'react';

/** @typedef {import('react').ReactNode} ReactNode */
/** @typedef {import('react').FunctionComponent} FunctionComponent */

/**
 * @typedef SuspenseErrorBoundaryProps
 *
 * @prop {NonNullable<ReactNode>|null} fallback Fallback to show while suspense pending.
 * @prop {(error: Error)=>void} onError Error callback.
 * @prop {ReactNode} children Suspense child.
 */

/**
 * @extends {Component<SuspenseErrorBoundaryProps>}
 */
class SuspenseErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  static getDerivedStateFromError() {
    return {};
  }

  componentDidCatch(error) {
    const { onError } = this.props;
    onError(error);
  }

  render() {
    const { fallback, children } = this.props;

    return <Suspense fallback={fallback}>{children}</Suspense>;
  }
}

export default SuspenseErrorBoundary;
