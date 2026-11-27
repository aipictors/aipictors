import type { FragmentOf } from "gql.tada"
import type { CSSProperties } from "react"
import { TabsContent } from "~/components/ui/tabs"
import { UserModelPickupBanner } from "~/components/user-models/user-model-pickup-banner"
import {
  HomePromotionWorksSection,
  PROMOTION_FILL_COUNT,
} from "~/components/work/work-promotion"
import { useTranslation } from "~/hooks/use-translation"
import { HomeDailyThemeCard } from "~/routes/($lang)._main._index/components/home-daily-theme-card"
import {
  HomeDeferredSection,
  HomeWorkSectionPlaceholder,
} from "~/routes/($lang)._main._index/components/home-deferred-section"
import {
  HomeModelLinks,
  HomeTopCreators,
} from "~/routes/($lang)._main._index/components/home-discovery-links"
import { HomeQuickLinks } from "~/routes/($lang)._main._index/components/home-quick-links"
import { HomeQuickPreviewBar } from "~/routes/($lang)._main._index/components/home-quick-preview-bar"
import { HomeSidebar } from "~/routes/($lang)._main._index/components/home-sidebar"
import { HomeTagList } from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagWorksPlaceholder,
  HomeTagWorksSection,
  HomeWorksShelf,
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
          {/* 宣伝枠の空いたマスは、おすすめの末尾の作品で埋める（その作品は下の推薦・ほかのおすすめには出さない） */}
          <HomePromotionWorksSection
            fillWorks={(data.promotionFillWorks ?? []).slice(
              -PROMOTION_FILL_COUNT,
            )}
          />
          {/* おすすめ作品（ユーザからの推薦）。サーバーで取った一覧をすぐ出す（スクロールやログイン確認を待たない） */}
          <HomeWorksUsersRecommendedSection
            works={
              data.promotionWorks as FragmentOf<
                typeof HomePromotionWorkFragment
              >[]
            }
            fillWorks={
              (data.promotionFillWorks ?? []).slice(
                0,
                -PROMOTION_FILL_COUNT,
              ) as FragmentOf<typeof HomePromotionWorkFragment>[]
            }
            onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
            onWorksLoaded={(works) =>
              updateHomeSectionWorks("recommended", works)
            }
          />
          {/* ここから下はちちぷいのトップと同じく、作品の一覧を何段も続ける（いま人気 → ランキング → タグごと）。
              お題やプランの案内・バナーは作品の一覧の後ろに置く */}
          <HomeWorksShelf
            title={t("いま人気", "Trending now")}
            description={t(
              "いま反応が集まっている作品",
              "Works getting reactions right now",
            )}
            link="/new-works?view=popular"
            works={data.trendWorks}
            imageWidth={320}
          />
          {/* デイリーランキング（上位 12 件） */}
          {data.rankingWorks.length > 0 && (
            <HomeWorksShelf
              title={t(
                `デイリーランキング（${data.rankingDateText.slice(5)}）`,
                `Daily ranking (${data.rankingDateText.slice(5)})`,
              )}
              link={`/rankings/${data.rankingDateText}`}
              works={data.rankingWorks}
              showRank
            />
          )}
          {/* タグごとの作品（今日のお題・人気タグ 5 つ）。loader で取れていれば最初の HTML に入れ、なければ画面に近づいてから読む */}
          <div style={offscreenSectionStyle(2400)}>
            {data.tagWorkRows.length > 0 ? (
              <HomeTagWorksSection initialRows={data.tagWorkRows} />
            ) : (
              <HomeDeferredSection fallback={<HomeTagWorksPlaceholder />}>
                <HomeTagWorksSection />
              </HomeDeferredSection>
            )}
          </div>
          {/* 新着作品（4 段） */}
          <HomeWorksShelf
            title={t("新着作品", "New works")}
            link="/new-works"
            works={data.newWorksShelf ?? []}
          />
          {/* 作品以外の入口（ちちぷいのトップの「モデルから作品をさがす」「おすすめのユーザー」） */}
          <HomeModelLinks />
          <HomeTopCreators creators={data.topCreators ?? []} />
          {/* 今日のお題への参加・ランキング・プランの案内 */}
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
          {/* 週替わりのピックアップモデル（みんなのモデルの看板） */}
          <UserModelPickupBanner />
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
        </div>
        {/* 右カラム（スクロールしても見えるように固定）。PC だけ新しいユーザー・コメント・人気タグも */}
        <HomeSidebar {...sidebar} recommendedTags={data.recommendedTags} />
      </div>
    </TabsContent>
  )
}
