import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskRatingButton } from "@/app/[lang]/generation/tasks/_components/generation-task-rating-button"
import { GenerationTaskZoomUpButton } from "@/app/[lang]/generation/tasks/_components/generation-task-zoom-up-button"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import { config } from "@/config"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
  estimatedSeconds?: number
  rating: number
  optionButtonSize: number
  isSelectDisabled: boolean
  task: ImageGenerationTaskFieldsFragment
  isPreviewByHover?: boolean
  onClick?(): void
  onCancel?(): void
}

/**
 * 画像生成の編集可能な履歴
 * @returns
 */
export const GenerationTaskEditableCard = (props: Props) => {
  const context = useGenerationContext()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [isHovered, setIsHovered] = useState(false)

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
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

  if (props.token == null || props.taskNanoid == null) {
    return (
      <InProgressGenerationCard
        estimatedSeconds={props.estimatedSeconds}
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
      />
    )
  }

  const { send } = GenerationConfigContext.useActorRef()

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
        <PrivateImage
          className={`generation-image-${props.taskNanoid}`}
          taskId={props.taskId}
          token={props.token}
          alt={"-"}
        />
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
      {isDesktop && isHovered && (
        <GenerationTaskRatingButton
          nowRating={props.rating}
          taskNanoid={props.taskNanoid}
          size={optionButtonSize(props.optionButtonSize)}
        />
      )}
    </div>
  )
}
