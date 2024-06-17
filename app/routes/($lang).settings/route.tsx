import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { HeaderDevelopBanner } from "@/_components/header-develop-banner"
import { AuthContext } from "@/_contexts/auth-context"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { SettingsRouteList } from "@/routes/($lang).settings/_components/settings-route-list"
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
      <HeaderDevelopBanner />
      <AppColumnLayout>
        <AppAside>
          <SettingsRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
    </>
  )
}
