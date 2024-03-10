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

  /**
   * アイコンサイズのクラスを返す
   * @returns アイコンサイズのクラス
   */
  const sizeClassName = () => {
    if (props.size === 1) {
      return "h-4 w-4"
    }
    if (props.size === 2) {
      return "h-8 w-8"
    }
    return "h-12 w-12"
  }

  /**
   * フォントサイズのクラスを返す
   * @returns フォントサイズのクラス
   */
  const fontSizeClassName = () => {
    if (props.size === 1) {
      return "text-sm"
    }
    if (props.size === 2) {
      return "text-xl"
    }
    return "text-4xl"
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
      <div className="flex rounded-lg bg-white px-1">
        {isLoading ? (
          <Loader2Icon
            color="black"
            className={`animate-spin${sizeClassName()}`}
          />
        ) : (
          <StarIcon
            color="black"
            className={cn(
              props.nowRating !== 0 && !isLoading
                ? `fill-yellow-500${sizeClassName()}`
                : `fill-white${sizeClassName()}`,
            )}
          />
        )}
        {props.nowRating !== 0 && (
          <p className={`text-black${fontSizeClassName()}`}>
            {props.nowRating}
          </p>
        )}
      </div>
    </button>
  )
}
