"use client";

import { Suspense, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader } from "@/components/Loader";
import AppWalletProvider from "@/components/provider/AppWalletProvider";
import { FrameProvider } from "@/components/provider/FrameContext";

const ErrorBoundaryError = (props: { error: unknown }) => (
  <div>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>
        {props.error instanceof Error
          ? props.error.message
          : typeof props.error === "string"
            ? props.error
            : JSON.stringify(props.error)}
      </code>
    </blockquote>
  </div>
);

const EnableErudaConsole = () => {
  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    import("eruda").then((lib) => lib.default.init({ container: el, tool: ["console", "elements"] }));
  }, []);

  return null;
};

export const GameProviders = (props: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <EnableErudaConsole />
      <FrameProvider>
        <Suspense fallback={<Loader />}>
          <AppWalletProvider>
            <main
              className="relative bg-cover overflow-x-hidden"
              style={{ background: `url('/img/bg.png')` }}
            >
              {props.children}
            </main>
          </AppWalletProvider>
          <Toaster />
        </Suspense>
      </FrameProvider>
    </ErrorBoundary>
  );
};
