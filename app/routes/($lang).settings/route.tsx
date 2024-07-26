import { AppCommonLayout } from "@/_components/app/app-common-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export default function SettingsLayout() {
  const authContext = useContext(AuthContext)

  if (authContext.isLoading) {
    return null
  }

  if (authContext.isNotLoggedIn) {
    return null
  }

  return (
    <>
      <AppCommonLayout outlet={<Outlet />} />
    </>
  )
}
