import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { skipToken, useSuspenseQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import { toast } from "sonner"

type Props = {
  children: React.ReactNode
}

/**
 * URLからエディタの状態を復元する
 * @param props
 */
export function GenerationConfigRestoration(props: Props) {
  const authContext = useContext(AuthContext)

  const context = useGenerationContext()

  const [searchParams] = useSearchParams()

  const ref = searchParams.get("ref")

  const workId = searchParams.get("work")

  const promptText = searchParams.get("prompts")

  const negativePromptText = searchParams.get("negativeprompts")

  const { send } = GenerationConfigContext.useActorRef()

  const { data } = useSuspenseQuery(
    imageGenerationResultQuery,
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
        data.imageGenerationResult !== null &&
        data.imageGenerationResult !== undefined
      ) {
        const task = data.imageGenerationResult
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
    } catch (_error) {
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
    } catch (_error) {
      // captureException(error)
      toast("タスクの復元に失敗しました。")
      return
    }
  }, [data?.imageGenerationResult.id])

  useEffect(() => {
    if (!promptText) return
    try {
      if (negativePromptText) {
        context.updatePromptAndNegativePrompt(promptText, negativePromptText)
      } else {
        context.updatePrompt(promptText)
      }
      toast("プロンプトを復元しました。", { position: "top-center" })
    } catch (_error) {
      // captureException(error)
      toast("プロンプトの復元に失敗しました。")
    }
  }, [promptText])

  useEffect(() => {
    send({ type: "CLOSE_PREVIEW" })
  }, [])

  return props.children
}

export const imageGenerationResultQuery = graphql(
  `query ImageGenerationResult($id: ID!) {
    imageGenerationResult(id: $id) {
      id
      steps
      sampler
      scale
      vae
      prompt
      promptsText
      negativePrompt
      seed
      sizeType
      clipSkip
      model {
        id
        type
      }
    }
  }`,
)

export const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      generationModelId
      steps
      sampler
      scale
      vae
      prompt
      negativePrompt
      clipSkip
    }
  }`,
)
