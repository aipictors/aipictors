import { TabsContent } from "~/components/ui/tabs"
import { RecommendedFeedContents } from "~/routes/($lang)._main._index/components/recommended-feed-contents"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type { HomeLoaderData } from "~/routes/($lang)._main._index/home-loader.server"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

/**
 * 「おすすめ」タブの中身（ホームのメイン）
 */
export function HomeRecommendedTabContent(
  props: Pick<
    HomePageState,
    | "isDialogMode"
    | "onChangeDialogMode"
    | "openWork"
    | "updateCurrentWorks"
    | "currentTab"
  > & { data: HomeLoaderData },
) {
  return (
    <TabsContent value="recommended" className="space-y-4">
      <HomeViewModeToggles
        className="justify-end"
        isDialogMode={props.isDialogMode}
        onDialogModeChange={props.onChangeDialogMode}
      />
      {props.currentTab === "recommended" && (
        // みんなの推薦（推薦機能）。1 行だけ出して、続きは「もっと見る」で
        <HomeWorksUsersRecommendedSection
          works={[]}
          onSelect={
            props.isDialogMode ? (idx) => props.openWork(idx) : undefined
          }
        />
      )}
      {props.currentTab === "recommended" && (
        <RecommendedFeedContents
          initialWorks={props.data.initialRecommendedWorks ?? []}
          onSelect={
            props.isDialogMode ? (idx) => props.openWork(idx) : undefined
          }
          updateWorks={props.updateCurrentWorks}
        />
      )}
    </TabsContent>
  )
}
