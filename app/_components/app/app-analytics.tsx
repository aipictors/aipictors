import { useLocation, useSearchParams } from "@remix-run/react"
import { getAnalytics, logEvent } from "firebase/analytics"
import { getApps } from "firebase/app"
import { useEffect } from "react"

export const AppAnalytics = () => {
  const { pathname } = useLocation()

  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (typeof window === "undefined") return
    if (import.meta.env.NODE_ENV === "development") return
    if (getApps().length === 0) return
    logEvent(getAnalytics(), "page_view", {
      page_path: pathname,
      page_title: pathname,
      page_location: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}
