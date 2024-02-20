import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { cn } from "@/lib/utils"
import { useMutation } from "@apollo/client"
import { StarIcon } from "@radix-ui/react-icons"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  taskNanoid: string
  nowRating: number
}

/**
 * 画像生成の履歴のレーティングボタン
 * @returns
 */
export const GenerationTaskRatingButton = (props: Props) => {
  const [mutation, { loading: isLoading }] = useMutation(
    updateRatingImageGenerationTaskMutation,
  )
  const changeRating = async (taskId: string, rating: number) => {
    try {
      await mutation({
        variables: {
          input: {
            nanoid: taskId,
            rating: rating,
          },
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onRating = async () => {
    changeRating(props.taskNanoid, props.nowRating !== 0 ? 0 : 1)
  }

  return (
    <button
      disabled={isLoading}
      type={"button"}
      onClick={onRating}
      className={cn(
        "absolute w-4 h-4 opacity-80 hover:opacity-40 rounded-full left-2 bottom-2 transition-all",
        props.nowRating !== 0 && !isLoading ? "bg-yellow-400" : "bg-white",
      )}
    >
      {isLoading ? (
        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <StarIcon scale={24} />
      )}
    </button>
  )
}
