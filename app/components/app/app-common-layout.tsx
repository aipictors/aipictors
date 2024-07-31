import { AppAside } from "~/components/app/app-aside"
import { AppContents } from "~/components/app/app-contents"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"
import { useState } from "react"

type Props = Readonly<{
  outlet: React.ReactNode
  title?: string
}>

/**
 * コンテンツ
 */
export function AppCommonLayout(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => {
    setIsOpen(false)
  }

  return (
    <>
      <HomeHeader
        onToggleSideMenu={() => {
          setIsOpen(!isOpen)
        }}
        title={props.title}
      />
      <AppContents
        aside={
          <AppAside isOpen={isOpen}>
            <HomeRouteList />
          </AppAside>
        }
        outlet={props.outlet}
        isOpen={isOpen}
      />
    </>
  )
}
