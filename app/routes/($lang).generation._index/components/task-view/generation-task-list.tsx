import { type FragmentOf, graphql } from "gql.tada"
import { Suspense, useEffect, useMemo, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useFocusTimeout } from "~/hooks/use-focus-timeout"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { ErrorResultCard } from "~/routes/($lang).generation._index/components/error-result-card"
import { FallbackTaskCard } from "~/routes/($lang).generation._index/components/fallback-task-card"
import {
  GenerationResultCardFragment,
  GenerationResultCardTaskFragment,
  GenerationTaskCard,
} from "~/routes/($lang).generation._index/components/generation-task-card"
import { PlanUpgradePrompt } from "~/routes/($lang).generation._index/components/plan-upgrade-prompt"
import { MobilePullToRefresh } from "~/routes/($lang).generation._index/components/task-view/mobile-pull-to-refresh"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import { getMaxPagesByPlan } from "~/routes/($lang).generation._index/utils/get-max-pages-by-plan"

type Props = {
  rating: number
  protect: number
  isEditMode: boolean
  isPreviewMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: number
  taskContentPositionType: TaskContentPositionType
  hidedTaskIds: string[]
  viewCount?: number
  currentPage: number
  results: FragmentOf<typeof GenerationTaskListItemFragment>[]
  tasks: FragmentOf<typeof GenerationTaskListItemTaskFragment>[]
  userToken: string
  setCurrentPage: (currentPage: number) => void
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
  onCancel?(): void
  setHidedTaskIds: (hidedTaskIds: string[]) => void
  onRefresh?: () => Promise<void> | void
}

/**
 * 画像生成履歴の一覧
 */
export function GenerationTaskList(props: Props) {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const t = useTranslation()

  const _isTimeout = useFocusTimeout()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const tasks = props.tasks

  if (tasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks ?? []

  /**
   * 非表示指定のタスクを除外
   */
  const currentTasks = imageGenerationTasks.filter((task) => {
    return (
      task.status === "RESERVED" ||
      (task.nanoid && !props.hidedTaskIds.includes(task.nanoid))
    )
  })

  const currentResults =
    props.results.filter((task) => {
      return task.nanoid && !props.hidedTaskIds.includes(task.nanoid)
    }) ?? []

  const onDelete = (taskId: string) => {
    props.setHidedTaskIds([...props.hidedTaskIds, ...taskId.split(",")])
  }

  const onRestore = (taskId: string) => {
    const task = tasks.find((task) => task.nanoid === taskId)
    if (typeof task === "undefined") return
    context.updateSettings(
      task.model.id,
      task.steps,
      task.model.type,
      task.sampler,
      task.scale,
      task.vae ?? "",
      task.prompt,
      task.negativePrompt,
      task.seed,
      task.sizeType,
      task.clipSkip,
      null,
      null,
      null,
      null,
    )
    toast("設定を復元しました")
  }

  const activeTasks = currentTasks.filter((task) => {
    if (task.isDeleted || (!task.imageUrl && task.status === "DONE"))
      return false
    return (
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS" ||
      task.status === "DONE" ||
      task.status === "RESERVED"
    )
  })

  const activeResults = currentResults.filter((result) => {
    if (!result.imageUrl && result.status === "DONE") return false
    return (
      result.status === "PENDING" ||
      result.status === "IN_PROGRESS" ||
      result.status === "DONE" ||
      result.status === "RESERVED"
    )
  })

  const onSelectTask = (taskId: string | null, status?: string) => {
    if (status !== "DONE") {
      toast("選択できない履歴です")
      return
    }

    if (!taskId) {
      toast("存在しない履歴です")
      return
    }

    const isAlreadySelected = props.selectedTaskIds.includes(taskId)

    if (isAlreadySelected) {
      props.setSelectedTaskIds(
        props.selectedTaskIds.filter((id) => {
          return id !== taskId
        }),
      )
      return
    }

    props.setSelectedTaskIds([...props.selectedTaskIds, taskId])
  }

  const componentTasks = activeTasks

  const perPage = props.rating === 0 || props.rating === -1 ? 56 : 800
  const maxPagesByPlan = getMaxPagesByPlan(queryData.currentPass?.type)

  const maxCountForPagination =
    (props.protect === 0 || props.protect === -1) &&
    (props.rating === 0 || props.rating === -1)
      ? (queryData.userStatus?.remainingImageGenerationTasksTotalCount ?? 0)
      : componentTasks.length

  const pageCount = Math.ceil(
    Math.min(maxCountForPagination, perPage * maxPagesByPlan) / perPage,
  )
  const lastPageIndex = Math.max(0, pageCount - 1)

  // いま存在するページ数の約1/3をジャンプ幅にする（最低1ページ）
  const jumpPages = Math.max(1, Math.floor(pageCount / 3))

  const canJumpBack = props.currentPage > 0
  const canJumpForward = props.currentPage < lastPageIndex

  const [pageInput, setPageInput] = useState(String(props.currentPage + 1))

  useEffect(() => {
    setPageInput(String(props.currentPage + 1))
  }, [props.currentPage])

  const pageInputHint = useMemo(() => {
    return t("ページ", "Page")
  }, [t])

  const goToPageByInput = () => {
    const raw = pageInput.trim()
    if (raw.length === 0) {
      setPageInput(String(props.currentPage + 1))
      return
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) {
      setPageInput(String(props.currentPage + 1))
      return
    }
    const clampedOneBased = Math.min(
      Math.max(1, Math.floor(parsed)),
      Math.max(1, pageCount),
    )
    setPageInput(String(clampedOneBased))
    props.setCurrentPage(
      Math.min(lastPageIndex, Math.max(0, clampedOneBased - 1)),
    )
  }

  const combinedTasks = [...componentTasks, ...activeResults]

  // 左右の作品へ遷移するときに使用するnanoidのリスト
  const taskIdList = combinedTasks
    .filter((task) => task.status === "DONE" && task.nanoid)
    .map((task) => task.id)

  const Grid = (
    <div
      className={cn("grid gap-2 pt-0 md:max-h-[calc(72vh-128px)]", {
        "grid-cols-0": props.thumbnailSize === 10,
        "grid-cols-1": props.thumbnailSize === 9,
        "grid-cols-2": props.thumbnailSize === 8,
        "grid-cols-3": props.thumbnailSize === 7,
        "grid-cols-4": props.thumbnailSize === 6,
        "grid-cols-5": props.thumbnailSize === 5,
        "grid-cols-6": props.thumbnailSize === 4,
        "grid-cols-7": props.thumbnailSize === 3,
        "grid-cols-8": props.thumbnailSize === 2,
        "grid-cols-9": props.thumbnailSize === 1,
        "grid-cols-10": props.thumbnailSize === 10,
      })}
    >
      {combinedTasks.map((task) => (
        <ErrorBoundary key={task.id} fallback={<ErrorResultCard />}>
          <Suspense fallback={<FallbackTaskCard />}>
            <GenerationTaskCard
              task={task}
              taskIds={taskIdList}
              taskContentPositionType={props.taskContentPositionType}
              isEditMode={props.isEditMode}
              isPreviewByHover={props.isPreviewMode}
              isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
              sizeType={props.thumbnailSize}
              isDialog={state === "HISTORY_LIST_FULL"}
              rating={props.rating}
              selectedTaskIds={props.selectedTaskIds}
              userToken={props.userToken}
              onClick={() => onSelectTask(task.nanoid, task.status)}
              onCancel={props.onCancel}
              onRestore={onRestore}
              onSelectTask={onSelectTask}
              onDelete={onDelete}
            />
          </Suspense>
        </ErrorBoundary>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* モバイル: プル・トゥ・リフレッシュ付きスクロール */}
      <div className="md:hidden">
        <MobilePullToRefresh
          onRefresh={props.onRefresh}
          scrollContainerClassName="max-h-96 px-2"
        >
          {Grid}
        </MobilePullToRefresh>
      </div>

      {/* デスクトップ: グリッドだけをスクロールし、ページングは常に表示 */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <ScrollArea type="always" className="min-h-0 flex-1 md:px-4">
          {/* <Suspense fallback={<AppLoadingPage />}> */}
          {Grid}
          {/* </Suspense> */}
        </ScrollArea>
      </div>

      <div className="shrink-0 space-y-3 p-2 pb-4 md:p-4 md:pt-2 md:pb-4">
        {props.protect !== 1 && (
          <>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!canJumpBack}
                title={t(
                  "履歴を大きく戻す（全ページの約1/3）",
                  "Jump back in history (~1/3 of pages)",
                )}
                onClick={() => {
                  props.setCurrentPage(
                    Math.max(0, props.currentPage - jumpPages),
                  )
                }}
              >
                {t(`-${jumpPages}ページ`, `-${jumpPages} pages`)}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {pageInputHint}
                </span>
                <Input
                  className="h-9 w-20 text-center"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={Math.max(1, pageCount)}
                  value={pageInput}
                  onChange={(event) => {
                    setPageInput(event.target.value)
                  }}
                  onBlur={goToPageByInput}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      ;(event.currentTarget as HTMLInputElement).blur()
                    }
                  }}
                  aria-label={t("ページ番号", "Page number")}
                  title={t(
                    "ページ番号を入力して移動（フォーカスを外すと移動）",
                    "Type a page number to jump (moves on blur)",
                  )}
                />
                <span className="text-muted-foreground text-xs">
                  / {Math.max(1, pageCount)}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={!canJumpForward}
                title={t(
                  "履歴を大きく進める（全ページの約1/3）",
                  "Jump forward in history (~1/3 of pages)",
                )}
                onClick={() => {
                  props.setCurrentPage(
                    Math.min(lastPageIndex, props.currentPage + jumpPages),
                  )
                }}
              >
                {t(`+${jumpPages}ページ`, `+${jumpPages} pages`)}
              </Button>
            </div>
            <ResponsivePagination
              perPage={perPage}
              maxCount={
                (props.protect === 0 || props.protect === -1) &&
                (props.rating === 0 || props.rating === -1)
                  ? (queryData.userStatus
                      ?.remainingImageGenerationTasksTotalCount ?? 0)
                  : componentTasks.length
              }
              currentPage={props.currentPage}
              onPageChange={(page: number) => {
                props.setCurrentPage(page)
              }}
              isActiveButtonStyle={true}
              allowExtendedPagination={true}
              maxPages={maxPagesByPlan}
              disableScrollToTop={true}
            />
            <PlanUpgradePrompt currentPlan={queryData.currentPass?.type} />
          </>
        )}
      </div>
    </div>
  )
}

export const GenerationTaskListItemFragment = graphql(
  `fragment GenerationTaskListItem on ImageGenerationResultNode @_unmask {
    id
    model {
      id
      type
    }
    ...GenerationResultCard
  }`,
  [GenerationResultCardFragment],
)

export const GenerationTaskListItemTaskFragment = graphql(
  `fragment GenerationTaskListItemTask on ImageGenerationTaskNode @_unmask {
    id
    isDeleted
    model {
      id
      type
    }
    ...GenerationResultCardTask
  }`,
  [GenerationResultCardTaskFragment],
)
