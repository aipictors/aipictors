import { useContext } from "react"
import { TabsContent } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { RecommendedFeedContents } from "~/routes/($lang)._main._index/components/recommended-feed-contents"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import { HomePromotionStrip } from "~/routes/($lang)._main._index/components/home-promotion-strip"
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
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  return (
    <TabsContent value="recommended" className="space-y-6">
      {props.currentTab === "recommended" && (
        // みんなの推薦（推薦機能）。1 行だけ出して、続きは「もっと見る」で
        <HomePromotionStrip
          onSelect={
            props.isDialogMode ? (idx) => props.openWork(idx) : undefined
          }
        />
      )}
      {props.currentTab === "recommended" && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-base">
            {authContext.isLoggedIn
              ? t("あなたへのおすすめ", "For you")
              : t("いま人気の新着", "Trending new works")}
          </h2>
          <HomeViewModeToggles
            isDialogMode={props.isDialogMode}
            onDialogModeChange={props.onChangeDialogMode}
          />
        </div>
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
