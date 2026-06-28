"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

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
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold">خطا در بارگذاری صفحه</p>
          <p className="text-muted-foreground">لطفاً صفحه را رفرش کنید</p>
          <Button onClick={() => window.location.reload()}>رفرش</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
