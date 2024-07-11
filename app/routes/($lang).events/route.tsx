import { AppAside } from "@/_components/app/app-aside"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import { Outlet } from "@remix-run/react"

export default function EventsLayout() {
  return (
    <>
      <HomeHeader />
      <AppAside>
        <HomeRouteList />
      </AppAside>
      <div className="pr-4 pl-4 sm:pr-8 sm:pl-8 md:ml-1 md:pl-52">
        <Outlet />
        <HomeFooter />
      </div>
    </>
  )
}
