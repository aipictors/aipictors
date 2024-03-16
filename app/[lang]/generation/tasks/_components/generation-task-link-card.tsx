import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { SelectableCardButton } from "@/app/_components/selectable-card-button"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import Link from "next/link"
import { toast } from "sonner"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  thumbnailToken: string | null
  isSelected?: boolean
  estimatedSeconds?: number
  isSelectDisabled: boolean
  onClick?(): void
  onCancel?(): void
}

/**
 * 画像生成のリンク履歴
 * @returns
 */
export const GenerationTaskLinkCard = (props: Props) => {
  const context = useGenerationContext()

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
        estimatedSeconds={props.estimatedSeconds}
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
      />
    )
  }

  const viewToken =
    context.config.taskListThumbnailType === "light"
      ? props.thumbnailToken ?? ""
      : props.token ?? ""

  return (
    <div className="relative grid h-full overflow-hidden rounded bg-card p-0">
      <SelectableCardButton
        onClick={props.onClick}
        isSelected={props.isSelected}
        isDisabled={props.isSelectDisabled}
      >
        <Link href={`/generation/tasks/${props.taskNanoid}`}>
          <PrivateImage
            className={`generation-image-${props.taskNanoid}`}
            taskId={props.taskId}
            token={viewToken}
            isThumbnail={context.config.taskListThumbnailType === "light"}
            alt={"-"}
          />
        </Link>
      </SelectableCardButton>
    </div>
  )
}
