import { AppCommonLayout } from "@/_components/app/app-common-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { Outlet } from "@remix-run/react"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function MainLayout() {
  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
