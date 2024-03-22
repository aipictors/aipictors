import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { cn } from "@/lib/utils"
import { useMutation } from "@apollo/client"
import { StarIcon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  taskNanoid: string
  nowRating: number
  size: number
  onRatingChange(rating: number): void
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
      props.onRatingChange(rating)
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
        "absolute bottom-2 left-2 rounded-full opacity-80 transition-all hover:opacity-40",
      )}
    >
      <div className="flex rounded-lg bg-white px-1 py-1">
        {isLoading ? (
          <Loader2Icon color="black" className={"animate-spin"} />
        ) : props.nowRating !== 0 ? (
          <StarIcon color="white" className={"fill-black"} />
        ) : (
          <StarIcon
            color="black"
            className={cn(
              props.nowRating !== 0 && !isLoading ? "fill-black" : "fill-white",
            )}
          />
        )}
        {props.nowRating !== 0 && (
          <p className={cn("px-1 text-black")}>{props.nowRating}</p>
        )}
      </div>
    </button>
  )
}
