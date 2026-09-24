// oxlint-disable import/namespace
import * as Sentry from '@sentry/nextjs';
import { installTranslationResilience } from 'translation-resilience';

// ✦ Install the DOM shim before React renders because browser translators replace React-owned
//   text nodes, which can cause crashes and frozen updates.
installTranslationResilience();

if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
        blockAllMedia: false,
      }),
      Sentry.consoleLoggingIntegration(),
      Sentry.browserTracingIntegration(),

      ...(process.env.NODE_ENV === 'development' ? [Sentry.spotlightBrowserIntegration()] : []),
    ],

    tracesSampleRate: 1,

    replaysSessionSampleRate: 0.1,

    replaysOnErrorSampleRate: 1,

    enableLogs: true,

    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },

    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
