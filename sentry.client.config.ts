import { init } from "@sentry/nextjs"
import packageJSON from "./package.json" assert { type: "json" }

init({
  debug: false,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
  release: packageJSON.version,
  tracesSampleRate: 0.001,
  // replaysOnErrorSampleRate: 1.0,
  // replaysSessionSampleRate: 0.1,
  ignoreErrors: ["ApolloError"],
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
