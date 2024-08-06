import { AppAside } from "~/components/app/app-aside"
import { AppContents } from "~/components/app/app-contents"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"
import { useState, useEffect } from "react"
import { setCookie } from "~/utils/set-cookie"
import { getCookie } from "~/utils/get-cookie"

type Props = Readonly<{
  outlet: React.ReactNode
  title?: string
}>

/**
 * コンテンツ
 */
export function AppCommonLayout(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const size = getCookie("size-common-menu")
    if (size !== null) {
      setIsOpen(Number(size) === 1)
    }
  }, [])

  const onToggleSideMenu = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    setCookie("size-common-menu", newIsOpen ? 1 : 0)
  }

  return (
    <>
      <HomeHeader onToggleSideMenu={onToggleSideMenu} title={props.title} />
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
