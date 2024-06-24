import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ConstructionAlert } from "@/_components/construction-alert"
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
      <ConstructionAlert
        type="WARNING"
        message="このページは現在開発中です。不具合が起きる可能性があります。"
        fallbackURL={`https://www.aipictors.com/users?id=${authContext.userId}`}
        date={"2024-07-30"}
      />
      <AppColumnLayout>
        <AppAside>
          <SettingsRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
    </>
  )
}
