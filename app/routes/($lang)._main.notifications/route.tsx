import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import { NotificationList } from "~/routes/($lang)._main.notifications/components/notification-list"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Suspense, useContext } from "react"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"

export const meta: MetaFunction = (props) => {
  return createMeta(META.NOTIFICATIONS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

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
