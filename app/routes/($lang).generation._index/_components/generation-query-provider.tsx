import { AuthContext } from "@/_contexts/auth-context"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { useFocusTimeout } from "@/_hooks/use-focus-timeout"
import { checkInGenerationProgressStatus } from "@/_utils/check-in-generation-progress-status"
import { GenerationQueryContext } from "@/routes/($lang).generation._index/_contexts/generation-query-context"
import { useQuery } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
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

export const controlNetCategoriesQuery = graphql(
  `query ControlNetCategories {
    controlNetCategories {
      id
      name
      enName
      contents {
        id
        name
        enName
        module
        sizeKind
        imageUrl
        thumbnailImageUrl
      }
    }
  }`,
)

export const imageLoraModelsQuery = graphql(
  `query ImageLoraModels {
    imageLoraModels {
      id
      name
      description
      license
      prompts
      slug
      thumbnailImageURL
      genre
    }
  }`,
)

export const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }`,
)

export const negativePromptCategoriesQuery = graphql(
  `query NegativePromptCategories {
    negativePromptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)

export const promptCategoriesQuery = graphql(
  `query PromptCategories {
    promptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)

export const viewerImageGenerationStatusQuery = graphql(
  `query ViewerImageGenerationStatus {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
      normalPredictionGenerationWait
      standardPredictionGenerationWait
    }
    viewer {
      remainingImageGenerationTasksCount
      inProgressImageGenerationTasksCount
      inProgressImageGenerationTasksCost
      inProgressImageGenerationReservedTasksCount
      remainingImageGenerationTasksTotalCount
      availableImageGenerationMaxTasksCount
      imageGenerationWaitCount
      availableImageGenerationLoraModelsCount
      availableConsecutiveImageGenerationsCount
    }
  }`,
)
