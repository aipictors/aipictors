import { GenerationTaskCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-cancel-button"
import { Card } from "@/components/ui/card"
import { cancelImageGenerationReservedTaskMutation } from "@/graphql/mutations/cancel-image-generation-reserved-task"
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
    useMutation(cancelImageGenerationReservedTaskMutation)

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
      <Card className="relative">
        <GenerationTaskCancelButton
          onCancel={() => onCancelReservedTask(props.taskNanoid)}
          isCanceling={isCancelingReservedTask}
        />
        <Link
          className="h-full w-full"
          href={`/generation/tasks/${props.taskNanoid}`}
        >
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="mr-auto h-6 w-6 animate-spin" />
              <span className="ta-c mb-4 text-sm">{"reserved..."}</span>
            </div>
          </div>
        </Link>
      </Card>
    </>
  )
}