import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { useGenerationQuery } from "@/[lang]/generation/_hooks/use-generation-query"
import { GenerationTaskDeleteButton } from "@/[lang]/generation/tasks/_components/generation-task-delete-button"
import { GenerationTaskProtectedButton } from "@/[lang]/generation/tasks/_components/generation-task-protected-button"
import { GenerationTaskRatingButton } from "@/[lang]/generation/tasks/_components/generation-task-rating-button"
import { GenerationTaskZoomUpButton } from "@/[lang]/generation/tasks/_components/generation-task-zoom-up-button"
import { InProgressGenerationCard } from "@/[lang]/generation/tasks/_components/in-progress-generation-card"
import { ReservedGenerationCard } from "@/[lang]/generation/tasks/_components/reserved-generation-card"
import { PrivateImage } from "@/_components/private-image"
import { SelectableCardButton } from "@/_components/selectable-card-button"
import { Skeleton } from "@/_components/ui/skeleton"
import type { ImageGenerationTaskFieldsFragment } from "@/_graphql/__generated__/graphql"
import { cancelImageGenerationReservedTaskMutation } from "@/_graphql/mutations/cancel-image-generation-reserved-task"
import { cancelImageGenerationTaskMutation } from "@/_graphql/mutations/cancel-image-generation-task"
import { deleteImageGenerationTaskMutation } from "@/_graphql/mutations/delete-image-generation-task"
import { config } from "@/config"
import { useMutation } from "@apollo/client/index.js"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
  thumbnailToken: string | null
  estimatedSeconds?: number
  rating: number
  isProtected: boolean
  optionButtonSize: number
  isSelectDisabled: boolean
  task: ImageGenerationTaskFieldsFragment
  isPreviewByHover?: boolean
  onClick?(): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の編集可能な履歴
 * @returns
 */
export const GenerationTaskEditableCard = (props: Props) => {
  const context = useGenerationContext()

  const data = useGenerationQuery()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [isHovered, setIsHovered] = useState(false)

  const [rating, setRating] = useState(props.rating)

  const [isProtected, setIsProtected] = useState(props.isProtected)

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
  )

  const [cancelReservedTask, { loading: isCancelingReservedTask }] =
    useMutation(cancelImageGenerationReservedTaskMutation)

  const [deleteTask, { loading: isDeletedLoading }] = useMutation(
    deleteImageGenerationTaskMutation,
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

  if (
    props.token == null ||
    props.thumbnailToken == null ||
    props.taskNanoid == null
  ) {
    return (
      <InProgressGenerationCard
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
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
        {props.thumbnailToken && props.token ? (
          <PrivateImage
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`m-auto generation-image-${props.taskNanoid}`}
            taskId={props.taskId}
            token={
              context.config.taskListThumbnailType === "light"
                ? props.thumbnailToken
                : props.token
            }
            isThumbnail={context.config.taskListThumbnailType === "light"}
            alt={"-"}
          />
        ) : (
          <Skeleton className="h-[120px] w-[240px] rounded-xl" />
        )}
      </SelectableCardButton>
      {/* 拡大ボタン */}
      {isDesktop && isHovered && (
        <GenerationTaskZoomUpButton
          taskId={props.taskId}
          token={props.token}
          size={optionButtonSize(props.optionButtonSize)}
          setIsHovered={setIsHovered}
        />
      )}
      {/* お気に入りボタン */}
      {isDesktop && (isHovered || rating !== 0) && (
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
      {isDesktop && isHovered && props.isSelectDisabled && (
        <GenerationTaskDeleteButton
          onDeleteTask={onDeleteTask}
          isDeletedLoading={isDeletedLoading}
          taskNanoid={props.taskNanoid}
        />
      )}
      {/* 保護ボタン */}
      {isDesktop && (isHovered || isProtected) && (
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
