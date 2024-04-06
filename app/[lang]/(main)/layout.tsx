import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { HomeRouteList } from "@/[lang]/(main)/_components/home-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { AppColumnLayout } from "@/_components/app/app-column-layout"
import { HomeFooter } from "@/_components/home-footer"

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
