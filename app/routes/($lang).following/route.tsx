import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import { HomeRouteVerticalList } from "@/routes/($lang)._main._index/_components/home-route-vertical-list"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function FollowingLayout() {
  return (
    <>
      <HomeHeader />
      <div className="hidden h-8 md:block">
        <HomeRouteVerticalList />
      </div>
      <AppColumnLayout>
        <div className="block md:hidden">
          <AppAside>
            <HomeRouteList />
          </AppAside>
        </div>
        <Outlet />
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}
