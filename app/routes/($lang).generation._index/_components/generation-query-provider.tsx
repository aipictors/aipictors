import { GenerationQueryContext } from "@/[lang]/generation/_contexts/generation-query-context"
import { activeImageGeneration } from "@/[lang]/generation/_functions/active-image-generation"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { AuthContext } from "@/_contexts/auth-context"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
} from "@/_graphql/__generated__/graphql"
import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import { viewerImageGenerationStatusQuery } from "@/_graphql/queries/viewer/viewer-image-generation-status"
import { useQuery } from "@apollo/client/index.js"
import { useContext, useEffect } from "react"

type Props = {
  children: React.ReactNode
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageModels: ImageModelsQuery["imageModels"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
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

  const { data: status } = useQuery(viewerImageGenerationStatusQuery, {
    pollInterval: 2000,
  })

  const userNanoid = viewer?.viewer?.user.nanoid ?? null

  useEffect(() => {
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [userNanoid])

  // TODO: route.tsxでauthContext.isLoadingを使用したので不要
  useEffect(() => {
    if (authContext.isLoading) return
    if (authContext.isNotLoggedIn) return
    // ログイン状態が変わったら再取得
    refetch()
  }, [authContext.isLoggedIn])

  return (
    <GenerationQueryContext.Provider
      value={{
        promptCategories: props.promptCategories,
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
