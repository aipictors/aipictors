import { AppContents } from "~/components/app/app-contents"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import {} from "react"

type Props = Readonly<{
  outlet: React.ReactNode
  title?: string
}>

/**
 * コンテンツ
 */
export function AppCommonLayout(props: Props) {
  // const [isOpen, setIsOpen] = useState(false)

  // useEffect(() => {
  //   const size = getCookie("size-common-menu")
  //   if (size !== null) {
  //     setIsOpen(Number(size) === 1)
  //   }
  // }, [])

  // const onToggleSideMenu = () => {
  //   const newIsOpen = !isOpen
  //   setIsOpen(newIsOpen)
  //   setCookie("size-common-menu", newIsOpen ? 1 : 0)
  // }

  return (
    <>
      <HomeHeader onToggleSideMenu={() => {}} title={props.title} />
      <AppContents outlet={props.outlet} isOpen={false} />
    </>
  )
}
