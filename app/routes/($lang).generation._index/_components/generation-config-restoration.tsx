import { AuthContext } from "@/_contexts/auth-context"
import { imageGenerationTaskQuery } from "@/_graphql/queries/image-generation/image-generation-task"
import { workQuery } from "@/_graphql/queries/work/work"
import { config } from "@/config"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
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

  const [searchParams] = useSearchParams()

  const ref = searchParams.get("ref")

  const workId = searchParams.get("work")

  const promptText = searchParams.get("prompts")

  const { send } = GenerationConfigContext.useActorRef()

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && ref !== null
      ? { variables: { id: ref } }
      : skipToken,
  )

  const { data: work } = useSuspenseQuery(
    workQuery,
    workId !== null ? { variables: { id: workId } } : skipToken,
  )

  /**
   * URLのnanoidからタスクを復元
   */
  useEffect(() => {
    try {
      if (
        data !== null &&
        data !== undefined &&
        data.imageGenerationTask !== null &&
        data.imageGenerationTask !== undefined
      ) {
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
          null,
          null,
          null,
          null,
        )
        toast("タスクを復元しました。", { position: "top-center" })
        return
      }
    } catch (error) {
      // captureException(error)
      toast("タスクの復元に失敗しました。")
      return
    }

    try {
      if (
        work !== null &&
        work !== undefined &&
        work.work !== null &&
        work.work !== undefined
      ) {
        const workData = work.work
        if (workData) {
          context.updateSettings(
            workData.generationModelId ?? "",
            workData.steps ?? config.generationFeature.defaultStepsValue,
            config.generationFeature.defaultImageModelType,
            workData.sampler ?? config.generationFeature.defaultSamplerValue,
            workData.scale ?? config.generationFeature.defaultScaleValue,
            workData.vae ?? config.generationFeature.defaultVaeValue,
            workData.prompt ?? config.generationFeature.defaultPromptValue,
            workData.negativePrompt ??
              config.generationFeature.defaultNegativePromptValue,
            -1,
            "SD1_512_512",
            workData.clipSkip ?? config.generationFeature.defaultClipSkipValue,
            null,
            null,
            null,
            null,
          )
          toast("タスクを復元しました。", { position: "top-center" })
          return
        }
      }
    } catch (error) {
      // captureException(error)
      toast("タスクの復元に失敗しました。")
      return
    }
  }, [data?.imageGenerationTask.id])

  useEffect(() => {
    if (!promptText) return
    try {
      context.updatePrompt(promptText)
      toast("プロンプトを復元しました。", { position: "top-center" })
    } catch (error) {
      // captureException(error)
      toast("プロンプトの復元に失敗しました。")
    }
  }, [promptText])

  useEffect(() => {
    send({ type: "CLOSE_PREVIEW" })
  }, [])

  return props.children
}
