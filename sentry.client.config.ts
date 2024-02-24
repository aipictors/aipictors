import { init } from "@sentry/nextjs"

init({
  debug: false,
  // debug: process.env.NODE_ENV === "development",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE!,
  tracesSampleRate: 0.001,
  // replaysOnErrorSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,
  ignoreErrors: ["ApolloError"],
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
