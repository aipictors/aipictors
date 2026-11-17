import { type FragmentOf, graphql } from "gql.tada"
import { cn } from "~/lib/utils"
import { GenerationInfoOnlyCard } from "~/routes/($lang).generation._index/components/generation-info-only-card"
import { GenerationPostedBadge } from "~/routes/($lang).generation._index/components/generation-posted-badge"
import {
  GenerationRetentionExpiredOverlay,
  GenerationRetentionExpiringChip,
} from "~/routes/($lang).generation._index/components/generation-retention-badges"
import {
  EditableGenerationResultCardFragment,
  EditableGenerationResultCardTaskFragment,
  GenerationTaskEditableCard,
} from "~/routes/($lang).generation._index/components/generation-task-editable-card"
import {
  GenerationTaskResponsiveCard,
  ReadOnlyGenerationResultCardFragment,
  ReadOnlyGenerationResultCardTaskFragment,
} from "~/routes/($lang).generation._index/components/generation-task-responsive-card"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import { toRetentionState } from "~/routes/($lang).generation._index/utils/generation-retention"

type Props = {
  task:
    | FragmentOf<typeof GenerationResultCardFragment>
    | FragmentOf<typeof GenerationResultCardTaskFragment>
  taskIds?: string[]
  isEditMode: boolean
  isSelected?: boolean
  estimatedSeconds?: number
  selectedTaskIds: string[]
  rating: number
  sizeType: number
  taskContentPositionType?: TaskContentPositionType
  isDialog: boolean
  userToken: string
  onClick?(): void
  onCancel?(): void
  onRestore?(taskId: string): void
  onSelectTask(taskNanoid: string, status: string): void
  onDelete?(taskId: string): void
  /** 投稿済みならその作品の ID */
  postedWorkId?: string | null
}

/**
 * 画像生成タスク
 */
export function GenerationTaskCard(props: Props) {
  const queryData = useGenerationQuery()
  const isCompact = props.sizeType < 6
  // 保存期間（できあがった履歴だけ）。期限は今のプランで決まる
  const retention =
    props.task.status === "DONE"
      ? toRetentionState({
          completedAt: props.task.completedAt,
          isProtected: props.task.isProtected,
          plan: queryData.currentPass?.type,
          nowSeconds: Math.floor(Date.now() / 1000),
        })
      : ({ kind: "kept" } as const)

  // 画像は消えたが生成情報は残っている
  if (retention.kind === "deleted" && !props.task.imageUrl) {
    return (
      <div className="relative aspect-square min-w-0">
        <div className="absolute inset-0">
          <GenerationInfoOnlyCard task={props.task} isCompact={isCompact} />
        </div>
      </div>
    )
  }

  const isExpired = retention.kind === "expired" || retention.kind === "deleted"
  // 上のプランで戻せるものは押してもプランの案内だけ。戻せないもの（最上位のプラン）は開いて保護できる
  const restorePlan =
    retention.kind === "expired" || retention.kind === "deleted"
      ? retention.restorePlan
      : null
  const canRestoreByPlan = isExpired && restorePlan !== null

  return (
    // 一覧をそろえるため、どの履歴も正方形の枠に入れる
    <div className="relative aspect-square min-w-0">
      {/* 中身は枠いっぱいに重ねる（高さを枠から確実に受け取るため） */}
      <div
        className={cn(
          "absolute inset-0",
          // 期限切れはグレーにして、押しても開かない（プランの案内を重ねる）
          isExpired && "opacity-70 blur-[1.5px] grayscale",
          canRestoreByPlan && !props.isEditMode && "pointer-events-none",
        )}
      >
        {props.isEditMode && (
          <GenerationTaskEditableCard
            onClick={() =>
              props.onSelectTask(
                props.task.nanoid ?? "",
                props.task.status ?? "",
              )
            }
            taskId={props.task.id ?? ""}
            isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
            isSelectDisabled={false}
            taskNanoid={props.task.nanoid}
            task={props.task}
            estimatedSeconds={props.task.estimatedSeconds ?? 0}
            userToken={props.userToken}
            optionButtonSize={props.sizeType}
            rating={props.task.rating ?? 0}
            isProtected={props.task.isProtected ?? false}
            onDelete={props.onDelete}
            isImageLocked={canRestoreByPlan}
          />
        )}
        {!props.isEditMode && (
          <GenerationTaskResponsiveCard
            task={props.task}
            taskIds={props.taskIds}
            taskContentPositionType={props.taskContentPositionType}
            estimatedSeconds={props.task.estimatedSeconds ?? 0}
            selectedTaskIds={props.selectedTaskIds}
            sizeType={props.sizeType}
            isDialog={props.isDialog}
            userToken={props.userToken}
            onClick={props.onClick}
            onCancel={props.onCancel}
            onRestore={props.onRestore}
            onSelectTask={props.onSelectTask}
            onDelete={props.onDelete}
          />
        )}
      </div>
      {isExpired && (
        <GenerationRetentionExpiredOverlay
          daysLeft={retention.kind === "expired" ? retention.daysLeft : 0}
          restorePlan={restorePlan}
          isCompact={isCompact}
          isEditMode={props.isEditMode || !canRestoreByPlan}
        />
      )}
      {retention.kind === "expiring" && !props.isEditMode && (
        <GenerationRetentionExpiringChip
          daysLeft={retention.daysLeft}
          isCompact={isCompact}
        />
      )}
      {props.postedWorkId && (
        <GenerationPostedBadge
          workId={props.postedWorkId}
          isCompact={props.sizeType < 6}
        />
      )}
    </div>
  )
}

export const GenerationResultCardFragment = graphql(
  `fragment GenerationResultCard on ImageGenerationResultNode @_unmask {
    ...EditableGenerationResultCard
    ...ReadOnlyGenerationResultCard
  }`,
  [EditableGenerationResultCardFragment, ReadOnlyGenerationResultCardFragment],
)

export const GenerationResultCardTaskFragment = graphql(
  `fragment GenerationResultCardTask on ImageGenerationTaskNode @_unmask {
    ...EditableGenerationResultCardTask
    ...ReadOnlyGenerationResultCardTask
  }`,
  [
    EditableGenerationResultCardTaskFragment,
    ReadOnlyGenerationResultCardTaskFragment,
  ],
)
