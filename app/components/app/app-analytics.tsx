import { useLocation, useSearchParams } from "@remix-run/react"
import { getApps } from "firebase/app"
import { useEffect } from "react"
import { withFirebaseAnalytics } from "~/utils/run-after-load-idle"
import { trackFunnelEventOnce } from "~/utils/track-funnel-event"

export function AppAnalytics(): React.ReactNode {
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

  // Stripe の決済を終えて戻ってきたら課金の完了として数える（同じ決済は 1 回だけ）
  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (sessionId === null) return
    if (/\/plus\/success$/.test(pathname)) {
      trackFunnelEventOnce("purchase", sessionId, {
        item: searchParams.get("prepaid") === "1" ? "prepaid_pass" : "pass",
      })
      return
    }
    if (searchParams.get("checkout") === "premium-success") {
      trackFunnelEventOnce("purchase", sessionId, { item: "coins" })
    }
  }, [pathname, searchParams])

  return null
}
