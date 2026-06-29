import { Component, ErrorInfo, PropsWithChildren } from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Portfolio render failed.", error, errorInfo);
    document.body.style.overflowY = "auto";
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="main-body main-active">
          <section className="container1" style={{ display: "grid", placeItems: "center" }}>
            <div style={{ maxWidth: 760, padding: 24 }}>
              <h1 style={{ fontSize: "clamp(42px, 8vw, 96px)", lineHeight: 1, margin: 0 }}>
                Shilpi
              </h1>
              <p style={{ color: "#c2a4ff", fontSize: 24, marginTop: 16 }}>
                Innovation Design Engineer
              </p>
              <p style={{ fontSize: 18, color: "#eae5ec", opacity: 0.8 }}>
                The interactive portfolio could not load on this device. Please refresh the page.
              </p>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
