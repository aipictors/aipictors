import { useLocation, useSearchParams } from "@remix-run/react"
import { getApps } from "firebase/app"
import { useEffect } from "react"
import { withFirebaseAnalytics } from "~/utils/run-after-load-idle"

export function AppAnalytics (): React.ReactNode {
  const { pathname } = useLocation()

  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (typeof document === "undefined") return
    if (import.meta.env.NODE_ENV === "development") return
    if (getApps().length === 0) return
    const pageLocation = window.location.href
    withFirebaseAnalytics(({ getAnalytics, logEvent }) => {
      logEvent(getAnalytics(), "page_view", {
        page_path: pathname,
        page_title: pathname,
        page_location: pageLocation,
      })
    })
  }, [pathname, searchParams])

  return null
}
