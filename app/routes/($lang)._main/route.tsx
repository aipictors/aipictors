import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Outlet, useLocation } from "@remix-run/react"

const ADMIN_ROUTE_PATTERN =
  /^\/(?:ja|en)\/admin(?:\/(?:comments|reports|releases(?:\/new)?|users|works))?(?:\/)?$|^\/admin(?:\/(?:comments|reports|releases(?:\/new)?|users|works))?(?:\/)?$/

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
