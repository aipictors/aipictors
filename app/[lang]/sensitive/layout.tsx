import { HomeHeader } from "@/app/[lang]/(main)/_components/home-header"
import { SensitiveRouteList } from "@/app/[lang]/sensitive/_components/sensitive-route-list"
import { HomeFooter } from "@/app/_components/home-footer"
import { AppAside } from "@/components/app/app-aside"
import { Separator } from "@/components/ui/separator"

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
