import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { Outlet, useLocation } from "@remix-run/react"

const ADMIN_ROUTE_PATTERN =
  /^\/(?:ja|en)\/admin(?:\/(?:coin-histories|coins|comments|reports|releases(?:\/new)?|user-models|users|works))?(?:\/)?$|^\/admin(?:\/(?:coin-histories|coins|comments|reports|releases(?:\/new)?|user-models|users|works))?(?:\/)?$/

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

  if (isAdminRoute) {
    return <Outlet />
  }

  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
