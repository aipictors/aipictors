import { AuthContext } from "@/_contexts/auth-context"
import type { controlNetCategoriesQuery } from "@/_graphql/queries/controlnet-category/controlnet-category"
import type { imageLoraModelsQuery } from "@/_graphql/queries/image-model/image-lora-models"
import type { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import type { negativePromptCategoriesQuery } from "@/_graphql/queries/negative-prompt-category/negative-prompt-category"
import type { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/_graphql/queries/viewer/viewer-image-generation-status"
import { useFocusTimeout } from "@/_hooks/use-focus-timeout"
import { checkInGenerationProgressStatus } from "@/_utils/check-in-generation-progress-status"
import { GenerationQueryContext } from "@/routes/($lang).generation._index/_contexts/generation-query-context"
import { activeImageGeneration } from "@/routes/($lang).generation._index/_functions/active-image-generation"
import { useQuery } from "@apollo/client/index"
import type { ResultOf } from "gql.tada"
import { useContext, useEffect } from "react"

type Props = {
  children: React.ReactNode
  promptCategories: ResultOf<typeof promptCategoriesQuery>["promptCategories"]
  negativePromptCategories: ResultOf<
    typeof negativePromptCategoriesQuery
  >["negativePromptCategories"]
  controlNetCategories: ResultOf<
    typeof controlNetCategoriesQuery
  >["controlNetCategories"]
  imageModels: ResultOf<typeof imageModelsQuery>["imageModels"]
  imageLoraModels: ResultOf<typeof imageLoraModelsQuery>["imageLoraModels"]
}

/**
 * エディタに必要なデータを提供する
 * @param props
 */
export const GenerationQueryProvider = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: viewer, refetch } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const { data: status, refetch: refetchViewerImageGenerationStatus } =
    useQuery(viewerImageGenerationStatusQuery)

  const userNanoid = viewer?.viewer?.user.nanoid ?? null

  useEffect(() => {
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [userNanoid])

  const isTimeout = useFocusTimeout()

  const inProgressImageGenerationTasksCount =
    status?.viewer?.inProgressImageGenerationTasksCount ?? 0

  const imageGenerationWaitCount = status?.viewer?.imageGenerationWaitCount ?? 0

  useEffect(() => {
    const time = setInterval(async () => {
      if (isTimeout) {
        return
      }
      if (authContext.userId !== null) {
        const needFetch = await checkInGenerationProgressStatus(
          authContext.userId,
          inProgressImageGenerationTasksCount.toString(),
          imageGenerationWaitCount.toString(),
        )
        if (needFetch) {
          refetchViewerImageGenerationStatus()
        }
      }
    }, 2000)
    return () => {
      clearInterval(time)
    }
  }, [inProgressImageGenerationTasksCount, imageGenerationWaitCount])

  useEffect(() => {
    refetchViewerImageGenerationStatus()
  }, [authContext.isLoggedIn])

  return (
    <GenerationQueryContext.Provider
      value={{
        promptCategories: props.promptCategories,
        negativePromptCategories: props.negativePromptCategories,
        controlNetCategories: props.controlNetCategories,
        models: props.imageModels,
        loraModels: props.imageLoraModels,
        user: viewer?.viewer?.user ?? null,
        currentPass: viewer?.viewer?.currentPass ?? null,
        engineStatus: status?.imageGenerationEngineStatus ?? {
          normalTasksCount: 0,
          standardTasksCount: 0,
          normalPredictionGenerationWait: 0,
          standardPredictionGenerationWait: 0,
        },
        viewer: status?.viewer ?? {
          remainingImageGenerationTasksCount: 0,
          inProgressImageGenerationTasksCount: 0,
          inProgressImageGenerationTasksCost: 0,
          inProgressImageGenerationReservedTasksCount: 0,
          remainingImageGenerationTasksTotalCount: 0,
          availableImageGenerationMaxTasksCount: 0,
          imageGenerationWaitCount: 0,
          availableImageGenerationLoraModelsCount: 0,
          availableConsecutiveImageGenerationsCount: 0,
        },
      }}
    >
      {props.children}
    </GenerationQueryContext.Provider>
  )
}
