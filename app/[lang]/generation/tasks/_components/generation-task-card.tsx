import { GenerationImageDialogButton } from "@/app/[lang]/generation/tasks/[task]/_components/generation-image-dialog-button"
import { GenerationTaskRatingButton } from "@/app/[lang]/generation/tasks/_components/generation-task-rating-button"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import { config } from "@/config"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { Scan } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
  progress?: number
  remainingSeconds?: number
  rating: number
  onClick?(): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationTaskCard = (props: Props) => {
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

  if (props.token == null || props.taskNanoid == null) {
    return (
      <InProgressGenerationCard
        remainingSeconds={props.remainingSeconds}
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
      />
    )
  }

  return (
    <div
      className="relative grid p-0 h-auto overflow-hidden rounded bg-card"
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      <SelectableCardButton
        onClick={props.onClick}
        isSelected={props.isSelected}
      >
        <PrivateImage
          className={`generation-image-${props.taskNanoid}`}
          taskId={props.taskId}
          token={props.token}
          alt={"-"}
        />
      </SelectableCardButton>
      {/* 拡大ボタン */}
      {(!isDesktop && !props.isSelected) ||
        (isHovered && !props.isSelected && (
          <GenerationImageDialogButton
            isAbsolute={true}
            taskId={props.taskId}
            taskToken={props.token}
            children={
              <div
                onMouseEnter={() => {
                  setIsHovered(true)
                }}
              >
                <Scan color="black" />
              </div>
            }
          />
        ))}
      {/* お気に入りボタン */}
      {(!isDesktop && !props.isSelected) ||
        (isHovered && !props.isSelected && (
          <GenerationTaskRatingButton
            nowRating={props.rating}
            taskNanoid={props.taskNanoid}
          />
        ))}
    </div>
  )
}
