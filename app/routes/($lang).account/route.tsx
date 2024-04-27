import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { AccountRouteList } from "@/routes/($lang).account/_components/account-route-list"
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
