import React from "react";

type Props = { children: React.ReactNode };

export class ErrorBoundary extends React.Component<Props, { hasError: boolean; error?: any }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{maxWidth: 680, margin: "40px auto", padding: 16, fontFamily: "system-ui, sans-serif"}}>
          <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 8}}>Something went wrong</h1>
          <p style={{color: "#555"}}>The app failed to load. Please refresh the page. If the problem persists, contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
