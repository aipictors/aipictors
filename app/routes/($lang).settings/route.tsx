import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { SettingsRouteList } from "@/[lang]/settings/_components/settings-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
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
      <HomeHeader title={"設定"} />
      <AppColumnLayout>
        <AppAside>
          <SettingsRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
    </>
  )
}
