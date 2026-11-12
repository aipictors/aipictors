import { AppContents } from "~/components/app/app-contents"
import { HomeFooter } from "~/components/home-footer"
import { PlusMobileNotice } from "~/components/plus-entry-notice"
import { SidebarProvider } from "~/components/sidebar-provider"
import HomeHeader from "~/routes/($lang)._main._index/components/home-header"
import { HomeRouteList } from "~/routes/($lang)._main._index/components/home-route-list"

type Props = Readonly<{
  outlet: React.ReactNode
  title?: string
  /** 中で sticky を使う（横のはみ出しの隠し方を変える） */
  isStickyEnabled?: boolean
}>

/**
 * コンテンツ
 */
export function AppCommonLayout(props: Props): React.ReactNode {
  return (
    <SidebarProvider>
      <AppContents
        outlet={props.outlet}
        isStickyEnabled={props.isStickyEnabled}
        aside={<HomeRouteList title={props.title} />}
        header={
          <HomeHeader
            title={props.title}
            alwaysShowTitle={true}
            hasSidebarBrand={true}
          />
        }
        footer={<HomeFooter />}
      />
      <PlusMobileNotice />
    </SidebarProvider>
  )
}
