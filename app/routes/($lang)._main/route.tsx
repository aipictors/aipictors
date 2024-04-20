import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { HomeFooter } from "@/_components/home-footer"
import { HomeHeader } from "@/routes/($lang)._main._index/_components/home-header"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }]
}

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
