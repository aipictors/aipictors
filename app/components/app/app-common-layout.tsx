import { AppContents } from "~/components/app/app-contents"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"

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
      <AppContents
        outlet={props.outlet}
        aside={<HomeRouteList title={props.title} />}
        header={<HomeHeader title={props.title} />}
      />
    </>
  )
}
