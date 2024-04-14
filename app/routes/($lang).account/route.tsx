import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { AccountRouteList } from "@/[lang]/account/_components/account-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import { Outlet } from "@remix-run/react"
import { useContext } from "react"

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
      <HomeHeader title={"アカウント"} />
      <AppColumnLayout>
        <AppAside>
          <AccountRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
    </>
  )
}

export function HydrateFallback() {
  return <AppLoadingPage />
}
