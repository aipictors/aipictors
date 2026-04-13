import { AppCommonLayout } from "~/components/app/app-common-layout"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Outlet, useLocation } from "@remix-run/react"

export function HydrateFallback () {
  return <AppLoadingPage />
}

export default function MainLayout () {
  const location = useLocation()
  const isAdminRoute = /^\/(ja|en)\/admin(\/|$)|^\/admin(\/|$)/.test(
    location.pathname,
  )

  if (isAdminRoute) {
    return <Outlet />
  }

  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
