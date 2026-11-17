import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AppMobileTabBar } from "~/components/app/app-mobile-tab-bar"
import {
  RequestsHubNav,
  type RequestsOutletContext,
  useRequestsBadge,
} from "~/components/requests/requests-hub-nav"
import { SidebarProvider } from "~/components/sidebar-provider"
import { useTranslation } from "~/hooks/use-translation"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"

/**
 * /foo/requests の foo が言語として受け付けられてしまうので、404 にする（_main と同じ）
 */
export function loader(props: LoaderFunctionArgs) {
  const lang = props.params.lang
  if (lang !== undefined && lang !== "en" && lang !== "ja" && lang !== "r") {
    throw new Response("Not Found", { status: 404 })
  }
  return null
}

export function HydrateFallback() {
  return <AppLoadingPage />
}

/**
 * リクエスト（/requests 以下）
 * 作品や生成の左メニューを出さず、上の「探す / 依頼の管理 / 自分のプラン」だけで行き来する
 */
export default function RequestsLayout() {
  const t = useTranslation()
  const badge = useRequestsBadge()
  const outletContext: RequestsOutletContext = { badge }

  return (
    <SidebarProvider>
      <HomeHeader
        alwaysShowTitle={true}
        showPcSheetMenu={true}
        title={t("Aipictorsリクエスト", "Aipictors Requests")}
      />
      <main id="main-content" className="w-full min-w-0">
        <RequestsHubNav badge={badge} />
        <Outlet context={outletContext} />
      </main>
      <AppMobileTabBar />
    </SidebarProvider>
  )
}
