import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { NotificationList } from "~/routes/($lang)._main.notifications/components/notification-list"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Suspense, useContext } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export const meta: MetaFunction = (props) => {
  return createMeta(META.NOTIFICATIONS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  return {}
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
