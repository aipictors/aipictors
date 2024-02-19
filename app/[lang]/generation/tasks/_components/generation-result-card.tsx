import { SelectableCardButton } from "@/app/[lang]/generation/_components/selectable-card-button"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { PrivateImage } from "@/app/_components/private-image"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { toast } from "sonner"

type Props = {
  taskId: string
  taskNanoid: string | null
  token: string | null
  isSelected?: boolean
  progress?: number
  remainingSeconds?: number
  onClick?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export const GenerationResultCard = (props: Props) => {
  if (props.token == null || props.taskNanoid == null) {
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
        toast("タスクをキャンセルしました")
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message)
        }
      }
    }

    return (
      <InProgressGenerationCard
        remainingSeconds={props.remainingSeconds}
        onCancel={() => onCancelTask(props.taskNanoid)}
        isCanceling={isCanceling}
      />
    )
  }

  return (
    <SelectableCardButton onClick={props.onClick} isSelected={props.isSelected}>
      <PrivateImage
        className={`generation-image-${props.taskNanoid}`}
        taskId={props.taskId}
        token={props.token}
        alt={"-"}
      />
    </SelectableCardButton>
  )
}
