import { SelectableCardButton } from "~/components/selectable-card-button"
import { Skeleton } from "~/components/ui/skeleton"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import { useMutation } from "@apollo/client/index"
import { useState } from "react"
import { toast } from "sonner"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { ReservedGenerationCard } from "~/routes/($lang).generation._index/components/reserved-generation-card"
import { InProgressGenerationCard } from "~/routes/($lang).generation._index/components/in-progress-generation-card"
import { GenerationTaskZoomUpButton } from "~/routes/($lang).generation._index/components/generation-task-zoom-up-button"
import { GenerationTaskRatingButton } from "~/routes/($lang).generation._index/components/generation-task-rating-button"
import { GenerationTaskDeleteButton } from "~/routes/($lang).generation._index/components/generation-task-delete-button"
import {
  GenerationResultProtectButtonFragment,
  GenerationResultProtectButtonTaskFragment,
  GenerationTaskProtectedButton,
} from "~/routes/($lang).generation._index/components/generation-task-protected-button"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  taskId: string
  taskNanoid: string | null
  isSelected?: boolean
  estimatedSeconds?: number
  rating: number
  isProtected: boolean
  optionButtonSize: number
  isSelectDisabled: boolean
  task:
    | FragmentOf<typeof EditableGenerationResultCardFragment>
    | FragmentOf<typeof EditableGenerationResultCardTaskFragment>
  isPreviewByHover?: boolean
  userToken: string
  onClick?(): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の編集可能な履歴
 */
export function GenerationTaskEditableCard(props: Props) {
  const context = useGenerationContext()

  const data = useGenerationQuery()

  const [isHovered, setIsHovered] = useState(false)

  const [rating, setRating] = useState(props.rating)

  const [isProtected, setIsProtected] = useState(props.isProtected)

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
  )

  const [cancelReservedTask, { loading: isCancelingReservedTask }] =
    useMutation(cancelImageGenerationReservedTaskMutation)

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationResultMutation,
  )

  /**
   * 生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelTask({ variables: { input: { nanoid: taskNanoid } } })
      if (props.onCancel) {
        props.onCancel()
      }
      toast("タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const { send } = GenerationConfigContext.useActorRef()

  /**
   * 生成タスクを削除する
   */
  const onDeleteTask = async () => {
    if (props.taskNanoid === null) {
      toast("削除に失敗しました。")
      return
    }

    try {
      await deleteTask({
        variables: {
          input: {
            nanoid: props.taskNanoid,
          },
        },
      })
      toast("削除しました。")
      if (props.onDelete) {
        props.onDelete(props.taskNanoid)
      }
    } catch (e) {
      toast("削除に失敗しました。")
    }
  }

  /**
   * 予約生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelReservedTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelReservedTask({ variables: { input: { nanoid: taskNanoid } } })
      if (props.onCancel) {
        props.onCancel()
      }
      toast("予約タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  /**
   * 履歴画像上に表示されるボタンのサイズ
   * @param size サイズ
   * @returns
   */
  const optionButtonSize = (size: number) => {
    if (size < 3) {
      return 1
    }
    if (size < 5) {
      return 2
    }
    return 3
  }

  if (props.task.status === "RESERVED") {
    return (
      <ReservedGenerationCard
        onClick={props.onClick}
        onCancel={() => onCancelReservedTask(props.task.nanoid)}
        isCanceling={isCanceling}
        taskId={props.taskId}
        isPreviewByHover={props.isPreviewByHover}
        setIsHovered={setIsHovered}
      />
    )
  }

  if (!props.task.imageUrl) {
    return (
      <InProgressGenerationCard
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
        inProgressNormalCount={data.engineStatus.normalPredictionGenerationWait}
        initImageGenerationWaitCount={data.viewer.imageGenerationWaitCount}
        imageGenerationWaitCount={data.viewer.imageGenerationWaitCount}
      />
    )
  }

  return (
    <div
      className="relative grid h-full overflow-hidden rounded bg-card p-0"
      onMouseEnter={() => {
        if (props.isPreviewByHover) {
          context.updatePreviewTaskId(props.task.id)
          send({ type: "OPEN_HISTORY_PREVIEW" })
        }
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        context.updatePreviewTaskId(null)
        send({ type: "CLOSE" })
        setIsHovered(false)
      }}
    >
      <SelectableCardButton
        onClick={props.onClick}
        isSelected={props.isSelected}
        isDisabled={props.isSelectDisabled}
      >
        {props.task.imageUrl !== "" &&
        props.task.thumbnailUrl !== "" &&
        props.task.thumbnailUrl !== null ? (
          <img
            className={`generation-image-${props.taskNanoid} m-auto`}
            src={
              context.config.taskListThumbnailType === "light"
                ? props.task.thumbnailUrl
                : props.task.imageUrl
            }
            data-original={props.task.imageUrl}
            alt={"-"}
          />
        ) : (
          <Skeleton className="h-[120px] w-[240px] rounded-xl" />
        )}
      </SelectableCardButton>
      {/* 拡大ボタン */}
      {isHovered && props.task.imageUrl && props.task.thumbnailUrl && (
        <GenerationTaskZoomUpButton
          taskId={props.taskId}
          token={props.userToken}
          size={optionButtonSize(props.optionButtonSize)}
          setIsHovered={setIsHovered}
          imageUrl={props.task.imageUrl}
          thumbnailUrl={props.task.thumbnailUrl}
        />
      )}
      {/* お気に入りボタン */}
      {(isHovered || rating !== 0) && props.taskNanoid && (
        <GenerationTaskRatingButton
          nowRating={rating}
          taskNanoid={props.taskNanoid}
          size={optionButtonSize(props.optionButtonSize)}
          onRatingChange={(newRating) => {
            setRating(newRating)
          }}
        />
      )}
      {/* 削除ボタン */}
      {isHovered && props.isSelectDisabled && (
        <GenerationTaskDeleteButton
          onDelete={onDeleteTask}
          isDeletedLoading={isDeletedLoading}
        />
      )}
      {/* 保護ボタン */}
      {(isHovered || isProtected) && props.taskNanoid && (
        <GenerationTaskProtectedButton
          isProtected={isProtected}
          taskNanoid={props.taskNanoid}
          size={optionButtonSize(props.optionButtonSize)}
          onProtectedChange={(isProtected) => {
            setIsProtected(isProtected)
          }}
        />
      )}
    </div>
  )
}

export const EditableGenerationResultCardFragment = graphql(
  `fragment EditableGenerationResultCard on ImageGenerationResultNode @_unmask {
    id
    nanoid
    status
    imageUrl
    thumbnailUrl
    estimatedSeconds
    rating
    ...GenerationResultProtectButton
  }`,
  [GenerationResultProtectButtonFragment],
)

export const EditableGenerationResultCardTaskFragment = graphql(
  `fragment EditableGenerationResultCardTask on ImageGenerationTaskNode @_unmask {
    id
    nanoid
    status
    imageUrl
    thumbnailUrl
    estimatedSeconds
    rating
    ...GenerationResultProtectButtonTask
  }`,
  [GenerationResultProtectButtonTaskFragment],
)

const cancelImageGenerationReservedTaskMutation = graphql(
  `mutation CancelImageGenerationReservedTask($input: CancelImageGenerationReservedTaskInput!) {
    cancelImageGenerationReservedTask(input: $input) {
      ...EditableGenerationResultCardTask
    }
  }`,
  [EditableGenerationResultCardTaskFragment],
)

const cancelImageGenerationTaskMutation = graphql(
  `mutation CancelImageGenerationTask($input: CancelImageGenerationTaskInput!) {
    cancelImageGenerationTask(input: $input) {
      ...EditableGenerationResultCardTask
    }
  }`,
  [EditableGenerationResultCardTaskFragment],
)

const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      ...EditableGenerationResultCard
    }
  }`,
  [EditableGenerationResultCardFragment],
)
