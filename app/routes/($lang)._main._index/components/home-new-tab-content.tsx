import { Minus, Plus, SlidersHorizontal } from "lucide-react"
import { Suspense } from "react"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import { TabsContent } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { HomeHotWorksSection } from "~/routes/($lang)._main._index/components/home-hot-works-section"
import { HomeNewUsersWorkListSection } from "~/routes/($lang)._main._index/components/home-new-user-work-list-section"
import { HomeNewWorksSkeleton } from "~/routes/($lang)._main._index/components/home-new-works-skeleton"
import { HomePaginationWorksSection } from "~/routes/($lang)._main._index/components/home-pagination-works-section"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import { HomeWorksFilterPanel } from "~/routes/($lang)._main._index/components/home-works-filter-panel"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import type { HomeLoaderData } from "~/routes/($lang)._main._index/home-loader.server"
import type { HomePageState } from "~/routes/($lang)._main._index/hooks/use-home-page-state"

/**
 * 「新着・人気」タブの中身
 */
export function HomeNewTabContent(
  props: HomePageState & { checkboxId: string; data: HomeLoaderData },
) {
  const t = useTranslation()
  const {
    activeFilterCount,
    data,
    handleWorkViewChange,
    internalIsPagination,
    isDialogMode,
    isFilterUiOpen,
    isOneWorkPerUser,
    isPromptPublic,
    newWorksPage,
    onChangeDialogMode,
    onChangePaginationMode,
    openWork,
    setInternalIsPagination,
    setIsFilterUiOpen,
    setNewWorksPage,
    sortType,
    timeRange,
    updateCurrentWorks,
    workType,
    workView,
  } = props

  return (
    <TabsContent value="new" className="flex flex-col space-y-4">
      {/* 新着 or 人気 or 新規ユーザの切り替えボタン */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex w-fit flex-wrap gap-0.5 rounded-full border bg-muted/40 p-0.5">
          <Button
            variant="ghost"
            onClick={() => handleWorkViewChange("new")}
            data-active={workView === "new"}
            size="sm"
            className="h-8 rounded-full px-4 font-medium data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
          >
            {t("新着", "New")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleWorkViewChange("popular")}
            data-active={workView === "popular"}
            size="sm"
            className="h-8 rounded-full px-4 font-medium data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
          >
            <div className="flex items-center space-x-1.5">
              <span>{t("人気", "Popular")}</span>
              <CrossPlatformTooltip
                text={t(
                  "最近投稿された人気作品が表示されます",
                  "Recently popular works",
                )}
              />
            </div>
          </Button>
          <Button
            variant="ghost"
            aria-label={t("新規ユーザ", "New Users")}
            onClick={() => handleWorkViewChange("new-user")}
            data-active={workView === "new-user"}
            size="sm"
            className="h-8 rounded-full px-4 font-medium data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
          >
            <div className="flex items-center space-x-1.5">
              <span className="hidden sm:inline">
                {t("新規ユーザ", "New Users")}
              </span>
              <span className="inline sm:hidden">{t("新規", "New")}</span>
              <CrossPlatformTooltip
                text={t(
                  "新規登録されたユーザの作品一覧です",
                  "List of works by newly registered users",
                )}
              />
            </div>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <HomeViewModeToggles
            isPagination={
              workView === "new-user" ? undefined : internalIsPagination
            }
            onPaginationChange={onChangePaginationMode}
            isDialogMode={isDialogMode}
            onDialogModeChange={onChangeDialogMode}
          />
          {workView === "new" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-full px-2.5 sm:gap-1.5 sm:px-3"
              onClick={() => setIsFilterUiOpen((v) => !v)}
              aria-expanded={isFilterUiOpen}
            >
              <SlidersHorizontal className="size-4" />
              {t("絞り込み", "Filters")}
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground tabular-nums">
                  {activeFilterCount}
                </span>
              )}
              {isFilterUiOpen ? (
                <Minus className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
      {workView === "new" && (
        <div className="space-y-4">
          {/* 絞り込み用のセレクト群 - レスポンシブレイアウト */}
          <div className="space-y-2">
            {isFilterUiOpen && <HomeWorksFilterPanel {...props} />}
          </div>

          {/* 新着作品 */}
          <Suspense
            fallback={
              <HomeNewWorksSkeleton
                view="new"
                isPagination={internalIsPagination}
              />
            }
          >
            {internalIsPagination ? (
              <HomePaginationWorksSection
                initialWorks={data.initialNewWorks}
                page={newWorksPage}
                setPage={setNewWorksPage}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
                timeRange={timeRange}
                isOneWorkPerUser={isOneWorkPerUser}
                autoPlayVideoPreview={true}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                updateWorks={updateCurrentWorks}
              />
            ) : (
              <HomeWorksSection
                page={newWorksPage}
                setPage={setNewWorksPage}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
                timeRange={timeRange}
                isOneWorkPerUser={isOneWorkPerUser}
                isPagination={false}
                onPaginationModeChange={setInternalIsPagination}
                autoPlayVideoPreview={true}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                updateWorks={updateCurrentWorks}
              />
            )}
          </Suspense>
        </div>
      )}

      {workView === "popular" && (
        <div className="space-y-4">
          <Suspense
            fallback={
              <HomeNewWorksSkeleton
                view="popular"
                isPagination={internalIsPagination}
              />
            }
          >
            <HomeHotWorksSection
              page={newWorksPage}
              setPage={setNewWorksPage}
              workType={workType}
              isPromptPublic={isPromptPublic}
              sortType={sortType}
              isPagination={internalIsPagination}
              onPaginationModeChange={setInternalIsPagination}
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </div>
      )}

      {workView === "new-user" && (
        <div className="space-y-4">
          <Suspense
            fallback={
              <HomeNewWorksSkeleton
                view="new-user"
                isPagination={internalIsPagination}
              />
            }
          >
            <HomeNewUsersWorkListSection
              workType={workType}
              isPromptPublic={isPromptPublic}
              sortType={sortType}
              isOneWorkPerUser={isOneWorkPerUser}
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </div>
      )}
    </TabsContent>
  )
}
