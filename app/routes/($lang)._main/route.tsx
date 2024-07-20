import { AppContents } from "@/_components/app/app-contents"
import { HomeFooter } from "@/_components/home-footer"
import HomeHeader from "@/routes/($lang)._main._index/_components/home-header"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Outlet } from "@remix-run/react"
import { useState } from "react"

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }]
}

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false)

  const onToggle = () => {
    setIsOpen((prevState) => !prevState)
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
