"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { HomeNavigationList } from "@/app/[lang]/(main)/_components/home-navigation-list"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"
import { AppDevelopmentPage } from "@/components/app/app-development-page"
import { config } from "@/config"

type Props = {
  children: React.ReactNode
}

const MainLayout = (props: Props) => {
  if (!config.isDevelopmentMode) {
    return <AppDevelopmentPage />
  }

  return (
    <>
      <HomeHeader />
      <AppColumnLayout>
        <AppAside>
          <HomeNavigationList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}

export default MainLayout
