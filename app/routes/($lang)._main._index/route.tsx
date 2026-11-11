import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useId } from "react"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { HomeEnglishHero } from "~/components/home-english-hero"
import { Tabs } from "~/components/ui/tabs"
import { WorkViewerDialog } from "~/components/work/lazy-work-viewer-dialog"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { HomeFeedTabContent } from "~/routes/($lang)._main._index/components/home-feed-tab-content"
import {
  HomeFollowTagTabContent,
  HomeFollowUserTabContent,
} from "~/routes/($lang)._main._index/components/home-follow-tab-contents"
import { HomeImportantReleaseBanner } from "~/routes/($lang)._main._index/components/home-important-release-banner"
import { HomeNewTabContent } from "~/routes/($lang)._main._index/components/home-new-tab-content"
import { HomeNewcomerReactionsCard } from "~/routes/($lang)._main._index/components/home-newcomer-reactions-card"
import { HomeRecommendedTabContent } from "~/routes/($lang)._main._index/components/home-recommended-tab-content"
import { homeLoader } from "~/routes/($lang)._main._index/home-loader.server"
import { useHomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"
import {
  HOME_TAB_PATHS,
  type HomeTab,
} from "~/routes/($lang)._main._index/utils/home-tabs"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  return homeLoader(props)
}

type HomeIndexPageProps = {
  forcedTab?: HomeTab
  /** /new-works として表示している（ページの見出しを変える） */
  isNewWorksPage?: boolean
}

export function HomeIndexPage(props: HomeIndexPageProps = {}) {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()
  const checkboxId = useId()

  const state = useHomePageState({ data, forcedTab: props.forcedTab })
  const {
    currentTab,
    displayedWorks,
    followFeedNew,
    handleTabChange,
    hasNextPage,
    internalIsPagination,
    isLoadingMore,
    loadMore,
    workDialog,
  } = state

  const isLoggedIn = state.authContext.isLoggedIn

  if (data === null) {
    return null
  }

  return (
    // ページの本文（読み上げソフトが本文の位置を見つけられるように main で囲む）
    <div className="space-y-4">
      {/* ページの見出し（画面には出さず、検索エンジンと読み上げのために置く） */}
      <h1 className="sr-only">
        {props.isNewWorksPage
          ? t("新着のAIイラスト・AI画像", "New AI illustrations and images")
          : t(
              "Aipictors（AIピクターズ）- AIイラスト・AI画像の投稿・生成サイト",
              "Aipictors - AI illustration & image posting and generation site",
            )}
      </h1>
      {data.importantRelease && (
        <HomeImportantReleaseBanner release={data.importantRelease} />
      )}
      {isLoggedIn && <HomeNewcomerReactionsCard />}

      <Tabs
        value={currentTab}
        defaultValue={currentTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <HomeEnglishHero />
        {/* ヘッダー部分: タブ */}
        <div className="-mx-4 bg-background/98 px-4 py-2">
          <div className="flex items-center justify-between gap-x-3 md:gap-x-6">
            <div className="min-w-0 flex-1">
              <AppAnimatedTabs
                tabs={[
                  {
                    label: t("ホーム", "Home"),
                    value: "home",
                    href: HOME_TAB_PATHS.home,
                  },
                  // フォロー中・お気に入りタグはログインしている人だけ（ログインしていないと中身が無い）
                  ...(isLoggedIn || currentTab === "follow-user"
                    ? [
                        {
                          label: t("フォロー中", "Following"),
                          value: "follow-user",
                          href: HOME_TAB_PATHS["follow-user"],
                          badge:
                            followFeedNew.count > 0 &&
                            currentTab !== "follow-user" ? (
                              <span className="fade-in-0 zoom-in-50 ml-1 inline-flex min-w-5 animate-in items-center justify-center rounded-full bg-clear-bright-blue px-1.5 align-middle font-bold text-[10px] text-white leading-5">
                                {followFeedNew.count >= 100
                                  ? "99+"
                                  : followFeedNew.count}
                              </span>
                            ) : null,
                        },
                      ]
                    : []),
                  {
                    label: t("おすすめ", "For you"),
                    value: "recommended",
                    href: HOME_TAB_PATHS.recommended,
                  },
                  ...(isLoggedIn || currentTab === "follow-tag"
                    ? [
                        {
                          label: t("お気に入りタグ", "Favorite tags"),
                          value: "follow-tag",
                          href: HOME_TAB_PATHS["follow-tag"],
                        },
                      ]
                    : []),
                  {
                    label: t("ランキング", "Ranking"),
                    value: "ranking",
                    href: "/rankings",
                  },
                  {
                    label: t("新着", "New"),
                    value: "new",
                    href: HOME_TAB_PATHS.new,
                  },
                ]}
                value={currentTab}
                onChange={handleTabChange}
              />
            </div>
          </div>
        </div>
        {/* ---------------------- タブ: ホーム（推薦・ランキングなどの欄） ---------------------- */}
        <HomeFeedTabContent {...state} data={data} />
        {/* ---------------------- タブ: おすすめ ---------------------- */}
        <HomeRecommendedTabContent {...state} data={data} />
        {/* ---------------------- タブ: 新着・人気 ---------------------- */}
        <HomeNewTabContent {...state} checkboxId={checkboxId} data={data} />
        {/* ---------------------- タブ: フォロー中のユーザ ---------------------- */}
        <HomeFollowUserTabContent {...state} />
        {/* ---------------------- タブ: お気に入りタグ ---------------------- */}
        <HomeFollowTagTabContent {...state} />
      </Tabs>

      {/* ────────── 作品ダイアログ ────────── */}
      {workDialog.isOpen && workDialog.workId && (
        <WorkViewerDialog
          works={displayedWorks}
          startWorkId={workDialog.workId}
          onClose={workDialog.closeDialog}
          loadMore={!internalIsPagination ? loadMore : undefined}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
        />
      )}
    </div>
  )
}

export default function Index() {
  return <HomeIndexPage forcedTab="home" />
}

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control":
    loaderHeaders.get("Cache-Control") ??
    "no-store, no-cache, must-revalidate, max-age=0",
})
