import { GenerationTaskCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-cancel-button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type Props = {
  taskNanoid: string
}

/**
 * 生成予約の履歴
 * @returns
 */
export const ReservedGenerationLinkCard = (props: Props) => {
  const [cancelReservedTask, { loading: isCancelingReservedTask }] =
    useMutation(deleteImageGenerationTaskMutation, {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    })

  /**
   * 予約生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelReservedTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelReservedTask({ variables: { input: { nanoid: taskNanoid } } })
      toast("予約タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <>
      <Card>
        <div>
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="m-auto h-6 w-6 animate-spin" />
              <span className="ta-c m-auto mb-4 text-sm">{"reserved..."}</span>
              <Link href={`/generation/tasks/${props.taskNanoid}`}>
                <Skeleton className="h-[120px] w-[240px] rounded-xl" />
              </Link>
            </div>
            <GenerationTaskCancelButton
              onCancel={() => onCancelReservedTask(props.taskNanoid)}
              isCanceling={isCancelingReservedTask}
            />
          </div>
        </div>
      </Card>
    </>
  )
}
