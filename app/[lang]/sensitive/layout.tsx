"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { SensitiveNavigationList } from "@/app/[lang]/sensitive/_components/sensitive-navigation"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { Separator } from "@/components/ui/separator"

type Props = {
  children: React.ReactNode
}

const SensitiveLayout = (props: Props) => {
  return (
    <>
      <HomeHeader />
      <div className="flex items-start space-x-0">
        <AppAside>
          <SensitiveNavigationList />
        </AppAside>
        {props.children}
      </div>
      <Separator />
      <HomeFooter />
    </>
  )
}

export default SensitiveLayout
