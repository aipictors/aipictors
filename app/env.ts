import { z } from "zod"

export const zEnv = z.object({
  VITE_SENTRY_VERSION: z.string(),
  VITE_APP_URL: z.string(),
  VITE_GRAPHQL_ENDPOINT: z.string(),
  VITE_FIREBASE_API_KEY: z.string(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string(),
  VITE_FIREBASE_PROJECT_ID: z.string(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  VITE_FIREBASE_APP_ID: z.string(),
  VITE_FIREBASE_MEASUREMENT_ID: z.string(),
})

export const env = zEnv.parse(import.meta.env)
