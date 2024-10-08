import { cn } from "~/lib/utils"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

type Props = {
  taskNanoid: string
  isProtected: boolean
  size: number
  onProtectedChange(isProtected: boolean): void
}

/**
 * 画像生成の履歴の保護ボタン
 */
export function GenerationTaskProtectedButton(props: Props) {
  const [mutation, { loading: isLoading }] = useMutation(
    updateProtectedImageGenerationResultMutation,
  )
  const changeProtected = async (taskId: string, isProtected: boolean) => {
    try {
      await mutation({
        variables: {
          input: {
            nanoid: taskId,
            isProtected: isProtected,
          },
        },
      })
      props.onProtectedChange(isProtected)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onRating = async () => {
    changeProtected(props.taskNanoid, !props.isProtected)
  }

  return (
    <button
      disabled={isLoading}
      type={"button"}
      onClick={onRating}
      className={cn(
        "absolute top-2 left-2 rounded-full opacity-80 transition-all hover:opacity-40",
      )}
    >
      <div className="flex rounded-lg bg-white px-1 py-1">
        {isLoading ? (
          <Loader2Icon color="black" className={"animate-spin"} />
        ) : props.isProtected ? (
          <LockKeyholeIcon color="black" className={"fill-gray"} />
        ) : (
          <LockKeyholeOpenIcon color="black" className={"fill-white"} />
        )}
      </div>
    </button>
  )
}

export const GenerationResultProtectButtonFragment = graphql(
  `fragment GenerationResultProtectButton on ImageGenerationResultNode @_unmask {
    id
    isProtected
  }`,
)

export const GenerationResultProtectButtonTaskFragment = graphql(
  `fragment GenerationResultProtectButtonTask on ImageGenerationTaskNode @_unmask {
    id
    isProtected
  }`,
)

const updateProtectedImageGenerationResultMutation = graphql(
  `mutation updateProtectedImageGenerationResult($input: UpdateProtectedImageGenerationResultInput!) {
    updateProtectedImageGenerationResult(input: $input) {
      ...GenerationResultProtectButton
    }
  }`,
  [GenerationResultProtectButtonFragment],
)
