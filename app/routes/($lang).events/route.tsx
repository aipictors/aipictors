import { AppContents } from "@/_components/app/app-contents"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import { Outlet } from "@remix-run/react"

export default function EventsLayout() {
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
