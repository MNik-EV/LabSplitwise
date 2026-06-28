"use client";

import { Component, type ReactNode } from "react";
import { ErrorFallback } from "@/components/shared/error-fallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
