import { AppContents } from "~/components/app/app-contents"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"

type Props = Readonly<{
  outlet: React.ReactNode
  title?: string
}>

/**
 * コンテンツ
 */
export function AppCommonLayout(props: Props) {
  return (
    <>
      <HomeHeader onToggleSideMenu={() => {}} title={props.title} />
      <AppContents outlet={props.outlet} isOpen={false} />
    </>
  )
}
