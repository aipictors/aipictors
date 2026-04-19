import { useLocation } from "@remix-run/react"
import { getPathLocale } from "~/utils/locale-path"

export function useLocale() {
  const location = useLocation()

  return getPathLocale(location.pathname)
}
