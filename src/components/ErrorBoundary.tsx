"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === "development";
      return (
        <main className="fixed inset-0 z-50 flex min-h-dvh items-end bg-[#f1eee6] p-6 text-[#101114] md:p-12">
          <div className="mx-auto grid w-full max-w-7xl gap-10 border-t border-black/20 pt-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase text-black/50">
                Signal interrompu · 500
              </p>
              <h1 className="mt-5 max-w-4xl text-balance text-[clamp(3rem,9vw,8rem)] font-medium leading-[0.82] tracking-[-0.06em]">
                La matière a perdu le fil.
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-base text-black/65">
                L&apos;expérience n&apos;a pas pu être affichée, mais rien n&apos;est perdu. Recharge la page pour reprendre depuis l&apos;index.
              </p>
              {isDevelopment && this.state.error?.message ? (
                <pre className="mt-6 max-w-3xl overflow-auto border-l border-black/25 pl-4 font-mono text-xs text-black/55">
                  {this.state.error.message}
                </pre>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-black px-6 text-sm transition-colors duration-200 hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Recharger l&apos;expérience
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
