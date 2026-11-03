import { useMutation } from "@apollo/client/index"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import {
  ImagePlusIcon,
  LayoutGridIcon,
  ListChecksIcon,
  ListIcon,
  Loader2Icon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import {
  type MyWork,
  WorksCards,
  WorksGrid,
  WorksTable,
} from "~/routes/($lang).my._index/components/my-work-items"
import type { SortType } from "~/types/sort-type"

const VIEW_KEY = "aipictors.myWorksView"

type Props = {
  works: MyWork[]
  worksCount: number
  isFiltered: boolean
  onClearFilters: () => void
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  onSort: (orderBy: IntrospectionEnum<"WorkOrderBy">, sort: SortType) => void
}

/**
 * 作品一覧（表とグリッドの切り替え、まとめて選択、削除）
 */
export function WorksList(props: Props) {
  const t = useTranslation()
  const [view, setView] = useState<"list" | "grid">("list")
  const [isSelectable, setIsSelectable] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [deleteTargets, setDeleteTargets] = useState<MyWork[]>([])
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const [deleteWork] = useMutation(bulkDeleteWorkMutation)

  // 前回の表示を覚える（保存した値はブラウザでしか読めないので、表示のあとで反映する）
  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "grid") setView("grid")
    } catch {
      // 読めなければ表のまま
    }
  }, [])

  const changeView = (next: "list" | "grid") => {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // 保存できなくても今の表示は切り替える
    }
  }

  const works = props.works.filter((work) => !deletedIds.includes(work.id))

  const onToggleSelect = (workId: string) => {
    setSelectedIds((current) =>
      current.includes(workId)
        ? current.filter((id) => id !== workId)
        : [...current, workId],
    )
  }

  const onToggleSelectAll = () => {
    const allSelected = works.every((work) => selectedIds.includes(work.id))
    setSelectedIds(allSelected ? [] : works.map((work) => work.id))
  }

  const exitSelectMode = () => {
    setIsSelectable(false)
    setSelectedIds([])
  }

  const onConfirmDelete = async () => {
    const targets = [...deleteTargets]
    const deleted: string[] = []
    setProgress({ done: 0, total: targets.length })
    // サーバーの負荷を避けるため 1 件ずつ削除する
    for (const work of targets) {
      try {
        await deleteWork({ variables: { input: { workId: work.id } } })
        deleted.push(work.id)
      } catch (error) {
        console.error(error)
      }
      setProgress({ done: deleted.length, total: targets.length })
    }
    setDeletedIds((current) => [...current, ...deleted])
    setProgress(null)
    setDeleteTargets([])
    exitSelectMode()
    toast(
      deleted.length === targets.length
        ? t(
            `${deleted.length}件の作品を削除しました。反映まで少しかかることがあります。`,
            `Deleted ${deleted.length} works`,
          )
        : t(
            `${deleted.length}件を削除しました（${targets.length - deleted.length}件は削除できませんでした）`,
            `Deleted ${deleted.length} works (${targets.length - deleted.length} failed)`,
          ),
    )
  }

  const sharedProps = {
    works,
    isSelectable,
    selectedIds,
    onToggleSelect,
    onDelete: (work: MyWork) => setDeleteTargets([work]),
  }

  return (
    <>
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        <p className="mr-auto text-muted-foreground text-sm tabular-nums">
          {t(
            `${props.worksCount.toLocaleString()}件の作品`,
            `${props.worksCount.toLocaleString()} works`,
          )}
        </p>
        <div
          role="group"
          aria-label={t("表示の切り替え", "View")}
          className="flex rounded-lg bg-muted p-0.5"
        >
          {(
            [
              ["list", ListIcon, t("リスト", "List")],
              ["grid", LayoutGridIcon, t("グリッド", "Grid")],
            ] as const
          ).map(([value, Icon, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              aria-label={label}
              title={label}
              onClick={() => changeView(value)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                view === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        {!isSelectable && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => setIsSelectable(true)}
            disabled={works.length === 0}
          >
            <ListChecksIcon className="mr-1.5 size-4" />
            {t("選択", "Select")}
          </Button>
        )}
      </div>

      {works.length === 0 ? (
        props.isFiltered ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
            <SearchXIcon className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              {t("条件に合う作品がありません", "No works match these filters")}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={props.onClearFilters}
            >
              {t("絞り込みを解除", "Clear filters")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
            <ImagePlusIcon className="size-8 text-muted-foreground" />
            <p className="font-semibold">
              {t("まだ作品がありません", "No works yet")}
            </p>
            <Button asChild>
              <Link to="/new/image">{t("作品を投稿", "Post a work")}</Link>
            </Button>
          </div>
        )
      ) : view === "grid" ? (
        <WorksGrid {...sharedProps} />
      ) : (
        <>
          <div className="hidden lg:block">
            <WorksTable
              {...sharedProps}
              sort={props.sort}
              orderBy={props.orderBy}
              onSort={props.onSort}
              onToggleSelectAll={onToggleSelectAll}
            />
          </div>
          <div className="lg:hidden">
            <WorksCards {...sharedProps} />
          </div>
        </>
      )}

      {/* 選んでいる間は、どこまでスクロールしても操作できるように固定する */}
      {isSelectable && (
        <div className="fixed bottom-16 left-1/2 z-30 flex w-max max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-2xl border bg-background/95 p-2 shadow-lg backdrop-blur">
          <span className="px-2 font-medium text-sm tabular-nums">
            {t(
              `${selectedIds.length}件を選択中`,
              `${selectedIds.length} selected`,
            )}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onToggleSelectAll}
          >
            {works.every((work) => selectedIds.includes(work.id))
              ? t("選択を解除", "Clear")
              : t("ページをすべて選択", "Select page")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={() =>
              setDeleteTargets(
                works.filter((work) => selectedIds.includes(work.id)),
              )
            }
          >
            <Trash2Icon className="mr-1 size-4" />
            {t("削除", "Delete")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={exitSelectMode}
          >
            {t("やめる", "Cancel")}
          </Button>
        </div>
      )}

      <AlertDialog
        open={deleteTargets.length > 0}
        onOpenChange={(open) => {
          if (!open && progress === null) setDeleteTargets([])
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTargets.length === 1
                ? t(
                    `「${deleteTargets[0]?.title}」を削除しますか？`,
                    `Delete "${deleteTargets[0]?.title}"?`,
                  )
                : t(
                    `${deleteTargets.length}件の作品を削除しますか？`,
                    `Delete ${deleteTargets.length} works?`,
                  )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {progress
                ? t(
                    `削除しています… ${progress.done} / ${progress.total}`,
                    `Deleting… ${progress.done} / ${progress.total}`,
                  )
                : t(
                    "削除した作品は元に戻せません。いいね・コメントなども見られなくなります。",
                    "Deleted works cannot be restored.",
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={progress !== null}>
              {t("キャンセル", "Cancel")}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={progress !== null}
              onClick={onConfirmDelete}
            >
              {progress && <Loader2Icon className="mr-1 size-4 animate-spin" />}
              {t("削除する", "Delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const bulkDeleteWorkMutation = graphql(
  `mutation BulkDeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
      isDeleted
    }
  }`,
)
