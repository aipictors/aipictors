import { useLocation } from "@remix-run/react"

export const useLocale = () => {
  const location = useLocation()

  if (location.pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
