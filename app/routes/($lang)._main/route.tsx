import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { HomeRouteList } from "@/[lang]/(main)/_components/home-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { HomeFooter } from "@/_components/home-footer"
import { Outlet } from "@remix-run/react"

export default function MainLayout() {
  return (
    <>
      <HomeHeader />
      <AppColumnLayout>
        <AppAside>
          <HomeRouteList />
        </AppAside>
        <Outlet />
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}