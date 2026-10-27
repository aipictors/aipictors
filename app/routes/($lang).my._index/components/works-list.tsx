import { useMutation } from "@apollo/client/index"
import { ListChecksIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { useState } from "react"
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
import type { SortType } from "~/types/sort-type"
import { WorksSpList } from "~/routes/($lang).my._index/components/works-sp-list"
import {
  WorksListTable,
  WorksListTableItemFragment,
} from "~/routes/($lang).my._index/components/works-list-table"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof WorkListItemFragment>[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  setAccessType: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  setSort: (sort: SortType) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickAgeTypeSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

/**
 * 作品一覧
 * 「まとめて削除」で複数の作品を選んで一度に削除できる
 */
export function WorksList (props: Props) {
  const t = useTranslation()
  const [isSelectable, setIsSelectable] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [deleteWork] = useMutation(bulkDeleteWorkMutation)

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

  const onDeleteSelected = async () => {
    const ids = [...selectedIds]
    const deleted: string[] = []
    setProgress({ done: 0, total: ids.length })
    // サーバーの負荷を避けるため 1 件ずつ削除する
    for (const id of ids) {
      try {
        await deleteWork({ variables: { input: { workId: id } } })
        deleted.push(id)
      } catch (error) {
        console.error(error)
      }
      setProgress({ done: deleted.length, total: ids.length })
    }
    setDeletedIds((current) => [...current, ...deleted])
    setProgress(null)
    setIsConfirmOpen(false)
    exitSelectMode()
    if (deleted.length === ids.length) {
      toast(
        t(
          `${deleted.length}件の作品を削除しました。しばらくするとアクセスできなくなります`,
          `Deleted ${deleted.length} works`,
        ),
      )
    } else {
      toast(
        t(
          `${deleted.length}件を削除しました（${ids.length - deleted.length}件は削除できませんでした）`,
          `Deleted ${deleted.length} works (${ids.length - deleted.length} failed)`,
        ),
      )
    }
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isSelectable ? (
          <>
            <span className="text-muted-foreground text-sm">
              {t(`${selectedIds.length}件を選択中`, `${selectedIds.length} selected`)}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="md:hidden"
              onClick={onToggleSelectAll}
            >
              {t("このページをすべて選択", "Select all on this page")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.length === 0}
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2Icon className="mr-1 size-4" />
              {t("選択した作品を削除", "Delete selected")}
            </Button>
            <Button size="sm" variant="ghost" onClick={exitSelectMode}>
              {t("やめる", "Cancel")}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSelectable(true)}
            disabled={works.length === 0}
          >
            <ListChecksIcon className="mr-1 size-4" />
            {t("まとめて削除", "Bulk delete")}
          </Button>
        )}
      </div>
      <div className="hidden md:block">
        <WorksListTable
          works={works}
          sort={props.sort}
          orderBy={props.orderBy}
          isSelectable={isSelectable}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickAgeTypeSortButton={props.onClickAgeTypeSortButton}
          onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
          onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
          onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
        />
      </div>
      <div className="block md:hidden">
        <WorksSpList
          works={works}
          sort={props.sort}
          orderBy={props.orderBy}
          isSelectable={isSelectable}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>
      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (progress === null) setIsConfirmOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                `${selectedIds.length}件の作品を削除しますか？`,
                `Delete ${selectedIds.length} works?`,
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {progress
                ? t(
                    `削除しています… ${progress.done} / ${progress.total}`,
                    `Deleting… ${progress.done} / ${progress.total}`,
                  )
                : t(
                    "削除した作品は元に戻せません。いいね・コメントなども消えます。",
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
              onClick={onDeleteSelected}
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

export const WorkListItemFragment = graphql(
  `fragment WorkListItem on WorkNode @_unmask {
    ...WorksListTableItem
  }`,
  [WorksListTableItemFragment],
)
