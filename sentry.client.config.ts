import { init } from "@sentry/nextjs"

init({
  debug: false,
  // debug: process.env.NODE_ENV === "development",
  dsn: "https://8807659038d0471fa7269051b1f2cc5f@o4505182281465856.ingest.sentry.io/4505364756234240",
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE!,
  tracesSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
