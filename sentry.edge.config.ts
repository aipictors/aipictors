import { init } from "@sentry/nextjs"

init({
  debug: false,
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  tracesSampleRate: 0,
  ignoreErrors: ["ApolloError"],
})
