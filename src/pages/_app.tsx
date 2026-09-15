import { type FC, useEffect, useMemo, Suspense } from "react";
import type { AppProps } from "next/app";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader } from "@/components/Loader";
import "@/styles/globals.css";
import AppWalletProvider from "@/components/provider/AppWalletProvider";
import { FrameProvider } from "@/components/provider/FrameContext";

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
  <div>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>{error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error)}</code>
    </blockquote>
  </div>
);

const BackButtonManipulator: FC = () => {
  const router = useRouter();
  const { back } = useNavigationRouter();

  useEffect(() => {}, [router]);

  return null;
};

const App: FC<AppProps> = ({ pageProps, Component }) => {
  return (
    <>
      <FrameProvider>
        <Suspense fallback={<Loader />}>
          <BackButtonManipulator />
          <AppWalletProvider>
            <main className="relative bgcover overflowxhidden" style={{ background: `url('/img/stars.svg')` }}>
              <Component {...pageProps} />
            </main>
          </AppWalletProvider>
          <Toaster />
        </Suspense>
      </FrameProvider>
    </>
  );
};

const Inner: FC<AppProps> = props => {
  const debug = useMemo(() => true, []);

  useEffect(() => {
    if (debug) {
      const el = document.createElement("div");
      document.body.appendChild(el);
      import("eruda").then(lib =>
        lib.default.init({
          container: el,
          tool: ["console", "elements"],
        }),
      );
    }
  }, [debug]);

  return <App {...props} />;
};

export default function CustomApp(props: AppProps) {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <Inner {...props} />
    </ErrorBoundary>
  );
}
