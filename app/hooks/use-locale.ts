import { useLocation } from "react-router"

export function useLocale() {
  const location = useLocation()

  if (location.pathname.startsWith("/en")) {
    return "en"
  }

  return "ja"
}
