import { AppAside } from "@/_components/app/app-aside"
import { HomeRouteList } from "@/routes/($lang)._main._index/_components/home-route-list"
import { useState } from "react"

type Props = Readonly<{
  outlet: React.ReactNode
  footer: React.ReactNode
}>

/**
 * コンテンツ
 */
export function AppContents(props: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const onToggle = () => {
    setIsOpen((prevState) => !prevState)
  }

  return (
    <>
      <div className="flex">
        <AppAside isOpen={isOpen} onToggle={onToggle}>
          <HomeRouteList />
        </AppAside>
        <div
          className={`container m-auto max-w-[100%] space-y-4 overflow-hidden ${isOpen ? "px-4 md:pr-8 md:pl-56" : "px-4 md:px-8"}`}
        >
          {props.outlet}
          {props.footer}
        </div>
      </div>
    </>
  )
}
