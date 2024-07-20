import { AppContents } from "@/_components/app/app-contents"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { HomeFooter } from "@/_components/home-footer"
import { AuthContext } from "@/_contexts/auth-context"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
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
      <AppContents
        header={<HomeHeader />}
        outlet={<Outlet />}
        footer={<HomeFooter />}
      />
    </>
  )
}
