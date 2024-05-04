import { createCookie } from "@remix-run/cloudflare"

export const userPrefs = createCookie("user-prefs", {
  maxAge: 604_800, // one week
})
