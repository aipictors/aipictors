"use client"

import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { HomeRouteList } from "@/app/[lang]/(main)/_components/home-route-list"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { AppColumnLayout } from "@/components/app/app-column-layout"

export const revalidate = 60

type Props = {
  children: React.ReactNode
}

export default function MainLayout(props: Props) {
  return (
    <>
      <HomeHeader />
      <AppColumnLayout>
        <AppAside>
          <HomeRouteList />
        </AppAside>
        {props.children}
      </AppColumnLayout>
      <HomeFooter />
    </>
  )
}
