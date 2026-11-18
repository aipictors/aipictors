import { UsersRoundIcon } from "lucide-react"
import { lazy, Suspense } from "react"
import { TabsContent } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { FollowFeedPlaceholder } from "~/routes/($lang)._main._index/components/follow-feed-placeholder"
import { HomeNewWorksSkeleton } from "~/routes/($lang)._main._index/components/home-new-works-skeleton"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

// フォロー新着・お気に入りタグ新着タブは表示したときにだけ読み込む
const FollowUserFeedContents = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/follow-user-feed-contents"
  ).then((mod) => ({ default: mod.FollowUserFeedContents })),
)

const FollowTagsFeedContents = lazy(() =>
  import(
    "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
  ).then((mod) => ({ default: mod.FollowTagsFeedContents })),
)

type FollowTabProps = Pick<
  HomePageState,
  | "currentTab"
  | "internalIsPagination"
  | "isDialogMode"
  | "onChangeDialogMode"
  | "onChangePaginationMode"
  | "openWork"
  | "updateCurrentWorks"
>

/**
 * 「フォロー新着」タブの中身
 */
export function HomeFollowUserTabContent(
  props: FollowTabProps &
    Pick<
      HomePageState,
      "followUserFeedPage" | "setFollowUserFeedPage" | "setInternalIsPagination"
    >,
) {
  const {
    currentTab,
    followUserFeedPage,
    internalIsPagination,
    isDialogMode,
    onChangeDialogMode,
    onChangePaginationMode,
    openWork,
    setFollowUserFeedPage,
    setInternalIsPagination,
    updateCurrentWorks,
  } = props

  const t = useTranslation()

  return (
    <TabsContent value="follow-user" className="space-y-4">
      {/* フォローの管理と表示の切り替え（1 行） */}
      <HomeViewModeToggles
        className="justify-end"
        leading={
          <Link
            to="/following"
            aria-label={t("フォローの管理", "Manage following")}
            title={t("フォローの管理", "Manage following")}
            className="flex size-8 items-center justify-center rounded-full border bg-muted/40 text-foreground/80 hover:text-foreground"
          >
            <UsersRoundIcon className="size-4" />
          </Link>
        }
        isPagination={internalIsPagination}
        onPaginationChange={onChangePaginationMode}
        isDialogMode={isDialogMode}
        onDialogModeChange={onChangeDialogMode}
      />

      {/* コンテンツ */}
      <Suspense fallback={<FollowFeedPlaceholder />}>
        <FollowUserFeedContents
          tab={currentTab}
          key={`follow-user-${followUserFeedPage}-${currentTab}`}
          page={followUserFeedPage}
          setPage={setFollowUserFeedPage}
          isPagination={internalIsPagination}
          onPaginationModeChange={setInternalIsPagination}
          onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
          updateWorks={updateCurrentWorks}
        />
      </Suspense>
    </TabsContent>
  )
}

/**
 * 「お気に入りタグ新着」タブの中身
 */
export function HomeFollowTagTabContent(
  props: FollowTabProps &
    Pick<HomePageState, "followTagFeedPage" | "setFollowTagFeedPage">,
) {
  const {
    currentTab,
    followTagFeedPage,
    internalIsPagination,
    isDialogMode,
    onChangeDialogMode,
    onChangePaginationMode,
    openWork,
    setFollowTagFeedPage,
    updateCurrentWorks,
  } = props

  return (
    <TabsContent value="follow-tag" className="space-y-4">
      {/* 表示の切り替え */}
      <HomeViewModeToggles
        className="justify-end"
        isPagination={internalIsPagination}
        onPaginationChange={onChangePaginationMode}
        isDialogMode={isDialogMode}
        onDialogModeChange={onChangeDialogMode}
      />

      <Suspense
        fallback={
          <HomeNewWorksSkeleton
            view="new"
            isPagination={internalIsPagination}
          />
        }
      >
        <FollowTagsFeedContents
          _tab={currentTab}
          key={`follow-tag-${followTagFeedPage}-${currentTab}`}
          page={followTagFeedPage}
          setPage={setFollowTagFeedPage}
          isPagination={internalIsPagination}
          onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
          updateWorks={updateCurrentWorks}
        />
      </Suspense>
    </TabsContent>
  )
}
