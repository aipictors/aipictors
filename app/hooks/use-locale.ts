import { useLocation } from "@remix-run/react"

export function useLocale() {
  const location = useLocation()

  if (location.pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
