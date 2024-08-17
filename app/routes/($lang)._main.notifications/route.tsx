import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { NotificationList } from "~/routes/($lang)._main.notifications/components/notification-list"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Suspense, useContext } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  return createMeta(META.NOTIFICATIONS)
}

/**
 * 通知の一覧
 */
export default function Notifications() {
  const authContext = useContext(AuthContext)

  return (
    <Suspense fallback={<AppLoadingPage />}>
      {authContext.isLoggedIn && <NotificationList />}
    </Suspense>
  )
}
