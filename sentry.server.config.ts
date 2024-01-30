// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { Config } from "@/config"
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://8807659038d0471fa7269051b1f2cc5f@o4505182281465856.ingest.sentry.io/4505364756234240",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: Config.sentryEnvironment,
  release: Config.sentryRelease,
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
