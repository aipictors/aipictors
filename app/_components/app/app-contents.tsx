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
          className={`m-auto max-w-[100%] space-y-4 overflow-hidden pr-4 pl-2 ${isOpen ? "md:pl-64" : "pl-4"}`}
        >
          {props.outlet}
          {props.footer}
        </div>
      </div>
    </>
  )
}