import { object, string } from "valibot"

export const vEnv = object({
  VITE_SENTRY_VERSION: string(),
  VITE_APP_URL: string(),
  VITE_GRAPHQL_ENDPOINT: string(),
  VITE_FIREBASE_API_KEY: string(),
  VITE_FIREBASE_AUTH_DOMAIN: string(),
  VITE_FIREBASE_PROJECT_ID: string(),
  VITE_FIREBASE_STORAGE_BUCKET: string(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: string(),
  VITE_FIREBASE_APP_ID: string(),
  VITE_FIREBASE_MEASUREMENT_ID: string(),
})

export const env = vEnv._parse(import.meta.env)
