import { AppAside } from "@/_components/app/app-aside"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { HomeFooter } from "@/_components/home-footer"
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
      <AppAside>
        <SettingsRouteList />
      </AppAside>
      <div className="pr-4 pl-4 sm:pr-8 sm:pl-8 md:ml-1 md:pl-52">
        <Outlet />
        <HomeFooter />
      </div>
    </>
  )
}
