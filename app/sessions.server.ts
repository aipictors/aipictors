import { createCookieSessionStorage } from "@remix-run/cloudflare"
import { createThemeSessionResolver } from "remix-themes"

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === "production"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    sameSite: "lax",
    secrets: ["s3cr3t"],
    ...(isProduction ? { domain: "aipictors.com", secure: true } : {}),
  },
})

export const themeSessionResolver = createThemeSessionResolver(sessionStorage)
