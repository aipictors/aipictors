import type { FragmentOf } from "gql.tada"
import type { CSSProperties } from "react"
import { Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { TabsContent } from "~/components/ui/tabs"
import { HomePromotionWorksSection } from "~/components/work/work-promotion"
import { useTranslation } from "~/hooks/use-translation"
import { HomeAwardWorkSection } from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeDeferredSection,
  HomeWorkSectionPlaceholder,
} from "~/routes/($lang)._main._index/components/home-deferred-section"
import type { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeNewUsersWorksSection } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeQuickPreviewBar } from "~/routes/($lang)._main._index/components/home-quick-preview-bar"
import { HomeSidebar } from "~/routes/($lang)._main._index/components/home-sidebar"
import { HomeSupportRankingSection } from "~/routes/($lang)._main._index/components/home-support-ranking-section"
import { HomeTagList } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagsSection } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeWorksGeneratedSection } from "~/routes/($lang)._main._index/components/home-works-generated-section"
import { HomeWorksTagSection } from "~/routes/($lang)._main._index/components/home-works-tag-section"
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
      <Suspense fallback={<AppLoadingPage />}>
        {data.dailyTheme && (
          <div>
            <HomeTagList
              themeTitle={data.dailyTheme.title}
              themeEnTitle={data.dailyTheme.enTitle}
              hotTags={data.hotTags}
            />
          </div>
        )}
      </Suspense>
      <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
        <div className="flex w-full min-w-0 flex-col space-y-4 overflow-hidden md:max-w-[calc(100%_-_278px)]">
          <HomeQuickPreviewBar
            events={data.eventPreviews}
            featuredReleases={data.featuredReleaseList}
            releaseList={data.releaseList}
          />
          <HomePromotionWorksSection />
          {/* サーバーで取った一覧をすぐ出す（スクロールやログイン確認を待たない） */}
          <HomeWorksUsersRecommendedSection
            works={
              data.promotionWorks as FragmentOf<
                typeof HomePromotionWorkFragment
              >[]
            }
            onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
            onWorksLoaded={(works) =>
              updateHomeSectionWorks("recommended", works)
            }
          />
          {/* ログインしている人だけ（未ログインでは中身が取れず、見出しだけ出ていた） */}
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
          <div style={offscreenSectionStyle(1400)}>
            <HomeNewUsersWorksSection
              works={
                data.newUserWorks as FragmentOf<
                  typeof HomeNewUsersWorksFragment
                >[]
              }
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              onWorksLoaded={(works) =>
                updateHomeSectionWorks("newUsers", works)
              }
            />
          </div>
          <div style={offscreenSectionStyle(1000)}>
            <HomeDeferredSection
              fallback={
                <HomeWorkSectionPlaceholder
                  title={t("前日ランキング", "Previous Day Ranking")}
                  variant="cropped"
                />
              }
            >
              <HomeAwardWorkSection
                awardDateText={data.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={[]}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
            </HomeDeferredSection>
          </div>
          <div style={offscreenSectionStyle(1000)}>
            <HomeDeferredSection
              fallback={
                <HomeWorkSectionPlaceholder
                  title={t("タグ作品", "Tag Works")}
                  variant="cropped"
                />
              }
            >
              <HomeWorksTagSection
                tag={data.firstTag}
                works={[]}
                secondTag={data.secondTag}
                secondWorks={[]}
                isCropped={true}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                onWorksLoaded={(works) => updateHomeSectionWorks("tags", works)}
              />
            </HomeDeferredSection>
          </div>
          <div style={offscreenSectionStyle(280)} className="space-y-4">
            <HomeTagsSection
              title={t("人気タグ", "Popular Tags")}
              tags={data.recommendedTags}
            />
          </div>
          {/* 表示する応援がないときは中身が空になる（空の枠で余白が増えないように隠す） */}
          <div style={offscreenSectionStyle(1400)} className="empty:hidden">
            <HomeSupportRankingSection />
          </div>
        </div>
        {/* 右カラム（スクロールしても見えるように固定） */}
        <HomeSidebar {...sidebar} />
      </div>
    </TabsContent>
  )
}
