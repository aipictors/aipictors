"use client"

import { BetaHeader } from "@/app/[lang]/(beta)/_components/beta-header"
import { BetaNavigationList } from "@/app/[lang]/(beta)/_components/beta-navigation-list"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"

type Props = {
  children: React.ReactNode
}

const BetaLayout = (props: Props) => {
  return (
    <>
      <BetaHeader />
      <AppColumnLayout>
        <AppAside>
          <BetaNavigationList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}

export default BetaLayout
