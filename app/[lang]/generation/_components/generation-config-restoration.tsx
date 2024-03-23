"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect } from "react"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

/**
 * エディタの初期化を提供する
 * @param props
 */
export const GenerationConfigRestoration = (props: Props) => {
  const authContext = useContext(AuthContext)

  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const ref = searchParams.get("ref")

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && ref
      ? {
          variables: {
            id: ref,
          },
        }
      : skipToken,
  )

  const prompts = searchParams.get("prompts")

  /**
   * URLのnanoidからタスクを復元
   */
  useEffect(() => {
    if (data !== undefined && data !== null) {
      try {
        if (data?.imageGenerationTask) {
          const task = data.imageGenerationTask
          context.updateSettings(
            task.model.id,
            task.steps,
            task.model.type,
            task.sampler,
            task.scale,
            task.vae ?? "",
            task.prompt,
            task.negativePrompt,
            task.seed,
            task.sizeType,
            task.clipSkip,
          )
          toast("タスクを復元しました。", { position: "top-center" })
        }
      } catch (error) {
        console.error(error)
      }
    }
    if (prompts !== undefined && prompts !== null) {
      try {
        context.updatePrompt(prompts)
        toast("プロンプトを復元しました。", { position: "top-center" })
      } catch (error) {
        console.error(error)
      }
    }
  }, [data, prompts])

  return props.children
}
