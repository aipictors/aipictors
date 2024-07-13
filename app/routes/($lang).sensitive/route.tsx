import { AppContents } from "@/_components/app/app-contents"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}

export default function SensitiveLayout() {
  return (
    <>
      <HomeHeader />
      <AppContents outlet={<Outlet />} footer={<HomeFooter />} />
    </>
  )
}
