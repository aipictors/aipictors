import { AppContents } from "@/_components/app/app-contents"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { Outlet } from "@remix-run/react"

export default function EventsLayout() {
  return (
    <>
      <HomeHeader />
      <AppContents outlet={<Outlet />} footer={<HomeFooter />} />
    </>
  )
}
