import { AuthContext } from "@/contexts/auth-context"
import { useFocusTimeout } from "@/hooks/use-focus-timeout"
import { checkInGenerationProgressStatus } from "@/utils/check-in-generation-progress-status"
import {
  type controlNetCategoryContextFragment,
  currentPassContextFragment,
  GenerationQueryContext,
  imageGenerationStatusContextFragment,
  imageGenerationViewerContextFragment,
  type imageLoraModelContextFragment,
  type imageModelContextFragment,
  type promptCategoryContextFragment,
} from "@/routes/($lang).generation._index/contexts/generation-query-context"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"

type Props = {
  children: React.ReactNode
  promptCategories: FragmentOf<typeof promptCategoryContextFragment>[]
  negativePromptCategories: FragmentOf<typeof promptCategoryContextFragment>[]
  controlNetCategories: FragmentOf<typeof controlNetCategoryContextFragment>[]
  imageModels: FragmentOf<typeof imageModelContextFragment>[]
  imageLoraModels: FragmentOf<typeof imageLoraModelContextFragment>[]
}

/**
 * エディタに必要なデータを提供する
 * @param props
 */
export const GenerationQueryProvider = (props: Props) => {
  const authContext = useContext(AuthContext)

  const {
    data: viewer,
    refetch,
    error,
  } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const { data: status, refetch: refetchViewerImageGenerationStatus } =
    useQuery(viewerImageGenerationStatusQuery)

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

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      ...CurrentPassContext
    }
  }`,
  [currentPassContextFragment],
)

const viewerImageGenerationStatusQuery = graphql(
  `query ViewerImageGenerationStatus {
    imageGenerationEngineStatus {
      ...ImageGenerationStatusContext
    }
    viewer {
      id
      ...ImageGenerationViewerContext
    }
  }`,
  [imageGenerationStatusContextFragment, imageGenerationViewerContextFragment],
)
