import type { FragmentOf } from "gql.tada"
import type { CSSProperties } from "react"
import { TabsContent } from "~/components/ui/tabs"
import { UserModelPickupBanner } from "~/components/user-models/user-model-pickup-banner"
import { HomePromotionWorksSection } from "~/components/work/work-promotion"
import { useTranslation } from "~/hooks/use-translation"
import { HomeDailyThemeCard } from "~/routes/($lang)._main._index/components/home-daily-theme-card"
import {
  HomeDeferredSection,
  HomeWorkSectionPlaceholder,
} from "~/routes/($lang)._main._index/components/home-deferred-section"
import { HomeHotCarousel } from "~/routes/($lang)._main._index/components/home-hot-carousel"
import { HomeQuickLinks } from "~/routes/($lang)._main._index/components/home-quick-links"
import { HomeQuickPreviewBar } from "~/routes/($lang)._main._index/components/home-quick-preview-bar"
import { HomeSidebar } from "~/routes/($lang)._main._index/components/home-sidebar"
import { HomeTagList } from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagWorksPlaceholder,
  HomeTagWorksSection,
} from "~/routes/($lang)._main._index/components/home-tag-works-section"
import { HomeWorksGeneratedSection } from "~/routes/($lang)._main._index/components/home-works-generated-section"
import type { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type { HomeLoaderData } from "~/routes/($lang)._main._index/home-loader.server"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

/**
 * 画面の外にある一覧は、近づくまでレイアウト・描画を省く（content-visibility: auto）。
 * スマホではトップの要素の 4 割が最初の画面の外にあり、表示直後のレイアウトが長いタスクになっていた。
 * 高さは描画するまでの仮の値（スマホでの実際の高さ。一度描画すると実際の高さを覚える）
 */
const offscreenSectionStyle = (estimatedHeight: number): CSSProperties => ({
  contentVisibility: "auto",
  containIntrinsicHeight: `auto ${estimatedHeight}px`,
})

/**
 * 「ホーム」タブの中身
 */
export function HomeFeedTabContent(
  props: Pick<
    HomePageState,
    | "authContext"
    | "isDialogMode"
    | "openWork"
    | "sidebar"
    | "updateHomeSectionWorks"
  > & { data: HomeLoaderData },
) {
  const t = useTranslation()
  const {
    authContext,
    data,
    isDialogMode,
    openWork,
    sidebar,
    updateHomeSectionWorks,
  } = props

  return (
    <TabsContent value="home" className="m-0 flex flex-col space-y-4">
      {/* 今日のお題を先頭にしたタグの横並び（丸いタブのすぐ下、スマホも PC も） */}
      {(data.dailyTheme || data.hotTags.length > 0) && (
        <HomeTagList
          themeTitle={data.dailyTheme?.title}
          themeEnTitle={data.dailyTheme?.enTitle}
          hotTags={data.hotTags}
        />
      )}
      <div className="block space-y-4 md:flex md:space-x-6 md:space-y-0">
        <div className="flex w-full min-w-0 flex-col space-y-6 md:max-w-[calc(100%_-_286px)] md:space-y-8">
          {/* お知らせ（開催中のイベント・サイトのお知らせ）は一番上 */}
          <HomeQuickPreviewBar
            events={data.eventPreviews}
            featuredReleases={data.featuredReleaseList}
            releaseList={data.releaseList}
          />
          {/* クリエイターの宣伝（PR、有料会員の特典）とユーザからの推薦は、お知らせのすぐ下で一番目立つ位置に */}
          <HomePromotionWorksSection />
          {/* おすすめ作品（ユーザからの推薦）。サーバーで取った一覧をすぐ出す（スクロールやログイン確認を待たない） */}
          <HomeWorksUsersRecommendedSection
            works={
              data.promotionWorks as FragmentOf<
                typeof HomePromotionWorkFragment
              >[]
            }
            fillWorks={
              (data.promotionFillWorks ?? []) as FragmentOf<
                typeof HomePromotionWorkFragment
              >[]
            }
            onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
            onWorksLoaded={(works) =>
              updateHomeSectionWorks("recommended", works)
            }
          />
          {/* いま人気 → 今日のお題 → ランキング・プラン */}
          <HomeHotCarousel works={data.hotWorks} />
          <div className="space-y-3">
            {data.dailyTheme && (
              <HomeDailyThemeCard
                theme={{
                  ...data.dailyTheme,
                  firstWork: data.dailyTheme.firstWork ?? null,
                }}
              />
            )}
            <HomeQuickLinks />
          </div>
          {/* 作品を選んで無料生成（生成への入口。ログインしている人だけ: 未ログインでは中身が取れず、見出しだけ出ていた） */}
          {authContext.isLoggedIn && (
            <div style={offscreenSectionStyle(1000)}>
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t(
                      "作品を選んで無料生成",
                      "Generate from featured works",
                    )}
                  />
                }
              >
                <HomeWorksGeneratedSection
                  works={[]}
                  dateText={data.awardDateText}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  onWorksLoaded={(works) =>
                    updateHomeSectionWorks("generated", works)
                  }
                />
              </HomeDeferredSection>
            </div>
          )}
          {/* 週替わりのピックアップモデル（みんなのモデルの看板） */}
          <UserModelPickupBanner />
          {/* タグごとの作品（今日のお題・人気タグ）。画面に近づいてから読む */}
          <div style={offscreenSectionStyle(900)}>
            <HomeDeferredSection fallback={<HomeTagWorksPlaceholder />}>
              <HomeTagWorksSection />
            </HomeDeferredSection>
          </div>
        </div>
        {/* 右カラム（スクロールしても見えるように固定）。PC だけ新しいユーザー・コメント・人気タグも */}
        <HomeSidebar {...sidebar} recommendedTags={data.recommendedTags} />
      </div>
    </TabsContent>
  )
}
