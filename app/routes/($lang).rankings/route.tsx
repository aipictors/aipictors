import { AppAside } from "@/_components/app/app-aside"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function RankingsLayout() {
  return (
    <>
      <HomeHeader />
      <AppAside>
        <HomeRouteList />
      </AppAside>
      <div className="pr-4 pl-4 sm:pr-8 sm:pl-8 md:ml-4 md:pl-52">
        <Outlet />
        <HomeFooter />
      </div>
    </>
  )
}
