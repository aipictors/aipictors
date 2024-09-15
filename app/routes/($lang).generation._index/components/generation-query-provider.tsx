import { AuthContext } from "~/contexts/auth-context"
import { useFocusTimeout } from "~/hooks/use-focus-timeout"
import { checkInGenerationProgressStatus } from "~/utils/check-in-generation-progress-status"
import {
  ControlNetCategoryContextFragment,
  CurrentPassContextFragment,
  GenerationQueryContext,
  ImageGenerationEngineStatusContextFragment,
  ImageGenerationUserContextFragment,
  ImageGenerationUserStatusContextFragment,
  ImageLoraModelContextFragment,
  ImageModelContextFragment,
  PromptCategoryContextFragment,
} from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
import { useContext, useEffect } from "react"

type Props = {
  children: React.ReactNode
  generationQueryContext: ResultOf<typeof GenerationQueryContextQuery>
}

/**
 * エディタに必要なデータを提供する
 * @param props
 */
export function GenerationQueryProvider(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: viewer } = useSuspenseQuery(ViewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const { data: status, refetch } = useSuspenseQuery(StatusQuery)

  const isTimeout = useFocusTimeout()

  const inProgressImageGenerationTasksCount =
    status.viewer?.inProgressImageGenerationTasksCount ?? 0

  const imageGenerationWaitCount = status.viewer?.imageGenerationWaitCount ?? 0

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
          refetch()
        }
      }
    }, 2000)
    return () => {
      clearInterval(time)
    }
  }, [inProgressImageGenerationTasksCount, imageGenerationWaitCount])

  useEffect(() => {
    refetch()
  }, [authContext.isLoggedIn])

  return (
    <GenerationQueryContext.Provider
      value={{
        ...props.generationQueryContext,
        user: viewer?.viewer?.user ?? null,
        currentPass: viewer?.viewer?.currentPass ?? null,
        engineStatus: status.imageGenerationEngineStatus ?? null,
        userStatus: status.viewer ?? null,
      }}
    >
      {props.children}
    </GenerationQueryContext.Provider>
  )
}

const ViewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        ...CurrentPassContextFragment
      }
      user {
        ...ImageGenerationUserContextFragment
      }
    }
  }`,
  [CurrentPassContextFragment, ImageGenerationUserContextFragment],
)

const StatusQuery = graphql(
  `query ViewerImageGenerationStatus {
    imageGenerationEngineStatus {
      ...ImageGenerationEngineStatusContextFragment
    }
    viewer {
      id
      ...ImageGenerationUserStatusContextFragment
    }
  }`,
  [
    ImageGenerationEngineStatusContextFragment,
    ImageGenerationUserStatusContextFragment,
  ],
)

/**
 * Loaderで実行する
 */
export const GenerationQueryContextQuery = graphql(
  `query GenerationQueryContextQuery {
    controlNetCategories {
      ...ControlNetCategoryContextFragment
    }
    imageLoraModels {
      ...ImageLoraModelContextFragment
    }
    imageModels {
      ...ImageModelContextFragment
    }
    negativePromptCategories {
      ...PromptCategoryContextFragment
    }
    promptCategories {
      ...PromptCategoryContextFragment
    }
  }`,
  [
    ControlNetCategoryContextFragment,
    ImageLoraModelContextFragment,
    ImageModelContextFragment,
    PromptCategoryContextFragment,
  ],
)
