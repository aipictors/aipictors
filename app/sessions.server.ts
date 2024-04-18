import { createCookieSessionStorage } from "@remix-run/cloudflare"
import { createThemeSessionResolver } from "remix-themes"

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
