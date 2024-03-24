"use client"

import { BetaHeader } from "@/app/[lang]/(main)/_components/beta-header"
import { BetaNavigationList } from "@/app/[lang]/(main)/_components/beta-navigation-list"
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

  // return (
  //   <>
  //     <HomeHeader />
  //     <AppColumnLayout>
  //       <AppAside>
  //         <HomeNavigationList />
  //       </AppAside>
  //       {props.children}
  //     </AppColumnLayout>
  //     <HomeFooter />
  //   </>
  // )

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

export default MainLayout
