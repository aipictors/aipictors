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
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import { graphql, type FragmentOf } from "gql.tada"
import { GenerationPostedBadge } from "~/routes/($lang).generation._index/components/generation-posted-badge"

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
  return (
    // 一覧をそろえるため、どの履歴も正方形の枠に入れる
    <div className="relative aspect-square min-w-0">
      {/* 中身は枠いっぱいに重ねる（高さを枠から確実に受け取るため） */}
      <div className="absolute inset-0">
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
