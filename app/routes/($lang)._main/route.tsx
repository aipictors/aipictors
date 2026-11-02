import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { SensitiveAgeGate } from "~/components/sensitive/sensitive-age-gate"
import { SensitiveBlurToggle } from "~/components/sensitive/sensitive-blur"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Outlet, useLocation } from "@remix-run/react"

const ADMIN_ROUTE_PATTERN =
  /^\/(?:ja|en)\/admin(?:\/(?:coin-histories|coins|comments|reports|releases(?:\/new)?|user-models|users|works))?(?:\/)?$|^\/admin(?:\/(?:coin-histories|coins|comments|reports|releases(?:\/new)?|user-models|users|works))?(?:\/)?$/

/**
 * この中で R18 の内容を出す /r のページ（検索・タグ一覧）
 * 作品ページと週間ランキングは、それぞれのルートで年齢確認を出している
 */
const R18_PAGE_IN_MAIN_PATTERN = /^(?:\/en)?\/r\/(?:search(?:\/|$)|tags\/?$)/

/**
 * /foo や /foo/rankings の foo が言語として受け付けられ、
 * 打ち間違えた URL でも 200 でトップなどが出てしまうので、404 にする
 */
export function loader (props: LoaderFunctionArgs) {
  const lang = props.params.lang
  if (lang !== undefined && lang !== "en" && lang !== "ja" && lang !== "r") {
    throw new Response("Not Found", { status: 404 })
  }
  return null
}

export function HydrateFallback () {
  return <AppLoadingPage />
}

export default function MainLayout () {
  const location = useLocation()
  const isAdminRoute = ADMIN_ROUTE_PATTERN.test(location.pathname)
  const isR18Page = R18_PAGE_IN_MAIN_PATTERN.test(location.pathname)

  if (isAdminRoute) {
    return <Outlet />
  }

  return (
    <>
      {isR18Page && <SensitiveAgeGate />}
      <AppCommonLayout outlet={<Outlet />} />
      {isR18Page && <SensitiveBlurToggle />}
    </>
  )
}
