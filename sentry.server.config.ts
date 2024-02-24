import { init } from "@sentry/nextjs"

init({
  debug: false,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT!,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE!,
  tracesSampleRate: 0.001,
  ignoreErrors: ["ApolloError"],
  beforeSend(event) {
    if (process.env.NODE_ENV !== "production") return null
    return event
  },
})
