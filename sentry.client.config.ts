// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { Config } from "@/config"
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://8807659038d0471fa7269051b1f2cc5f@o4505182281465856.ingest.sentry.io/4505364756234240",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === "development",

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  // integrations: [
  //   new Sentry.Replay({
  //     // Additional Replay configuration goes in here, for example:
  //     maskAllText: true,
  //     blockAllMedia: true,
  //   }),
  // ],

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE!,
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
