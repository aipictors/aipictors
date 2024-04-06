import { HomeHeader } from "@/[lang]/(main)/_components/home-header"
import { SensitiveRouteList } from "@/[lang]/sensitive/_components/sensitive-route-list"
import { AppAside } from "@/_components/app/app-aside"
import { HomeFooter } from "@/_components/home-footer"
import { Separator } from "@/_components/ui/separator"

export const revalidate = 60

type Props = {
  children: React.ReactNode
}

const SensitiveLayout = (props: Props) => {
  return (
    <>
      <HomeHeader />
      <div className="flex items-start space-x-0">
        <AppAside>
          <SensitiveRouteList />
        </AppAside>
        {props.children}
      </div>
      <Separator />
      <HomeFooter />
    </>
  )
}

export default SensitiveLayout
