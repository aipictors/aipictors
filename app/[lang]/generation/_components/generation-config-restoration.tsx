"use client"

import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { AuthContext } from "@/app/_contexts/auth-context"
import { imageGenerationTaskQuery } from "@/graphql/queries/image-generation/image-generation-task"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { captureException } from "@sentry/nextjs"
import { useSearchParams } from "next/navigation"
import { useContext, useEffect } from "react"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

/**
 * URLからエディタの状態を復元する
 * @param props
 */
export const GenerationConfigRestoration = (props: Props) => {
  const authContext = useContext(AuthContext)

  const context = useGenerationContext()

  const searchParams = useSearchParams()

  const ref = searchParams.get("ref")

  const promptText = searchParams.get("prompts")

  const { send } = GenerationConfigContext.useActorRef()

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && ref !== null
      ? { variables: { id: ref } }
      : skipToken,
  )

  /**
   * URLのnanoidからタスクを復元
   */
  useEffect(() => {
    if (data === undefined) return
    if (data === null) return
    try {
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
    } catch (error) {
      captureException(error)
      toast("タスクの復元に失敗しました。")
    }
  }, [data?.imageGenerationTask.id])

  useEffect(() => {
    if (promptText !== "string") return
    try {
      context.updatePrompt(promptText)
      toast("プロンプトを復元しました。", { position: "top-center" })
    } catch (error) {
      captureException(error)
      toast("プロンプトの復元に失敗しました。")
    }
  }, [promptText])

  useEffect(() => {
    send({ type: "CLOSE_PREVIEW" })
  }, [])

  return props.children
}
