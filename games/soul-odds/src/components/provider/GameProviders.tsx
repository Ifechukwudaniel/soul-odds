"use client";

import { Suspense, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader } from "@/components/Loader";
import { AppWalletProvider } from "@/components/provider/AppWalletProvider";
import { DesertHorizon } from "@/components/game/mortal-odds/DesertHorizon";

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
        <Suspense fallback={<Loader />}>
            <main
              className="relative overflow-x-hidden"
              style={{ background: `url('/img/stars.svg') repeat` }}
            >
              <DesertHorizon />
              <div className="relative z-10">
                <AppWalletProvider>{props.children}</AppWalletProvider>
              </div>
            </main>
          <ToastContainer theme="light" />
        </Suspense>
    </ErrorBoundary>
  );
};
