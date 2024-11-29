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
  NegativePromptCategoryContextFragment,
  PromptCategoryContextFragment,
} from "~/routes/($lang).generation.demonstration/contexts/generation-query-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql, readFragment, type ResultOf } from "gql.tada"
import { startTransition, useContext, useEffect } from "react"

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

  const { data: currentPassQueryResult } = useSuspenseQuery(CurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const { data: statusQueryResult, refetch } = useSuspenseQuery(StatusQuery)

  const currentPass = readFragment(
    CurrentPassContextFragment,
    currentPassQueryResult?.viewer?.currentPass,
  )

  const engineStatus = readFragment(
    ImageGenerationEngineStatusContextFragment,
    statusQueryResult.imageGenerationEngineStatus,
  )

  const user = readFragment(
    ImageGenerationUserContextFragment,
    currentPassQueryResult?.viewer?.user,
  )

  const userStatus = readFragment(
    ImageGenerationUserStatusContextFragment,
    statusQueryResult.viewer,
  )

  const isTimeout = useFocusTimeout()

  const inProgressImageGenerationTasksCount =
    userStatus?.inProgressImageGenerationTasksCount ?? 0

  const imageGenerationWaitCount = userStatus?.imageGenerationWaitCount ?? 0

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
          startTransition(() => {
            refetch()
          })
        }
      }
    }, 2000)
    return () => {
      clearInterval(time)
    }
  }, [inProgressImageGenerationTasksCount, imageGenerationWaitCount])

  useEffect(() => {
    startTransition(() => {
      refetch()
    })
  }, [authContext.isLoggedIn])

  return (
    <GenerationQueryContext.Provider
      value={{
        ...props.generationQueryContext,
        engineStatus,
        userStatus,
        currentPass: currentPass ?? null,
        user: user ?? null,
      }}
    >
      {props.children}
    </GenerationQueryContext.Provider>
  )
}

const CurrentPassQuery = graphql(
  `query CurrentPassQuery {
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
  `query StatusQuery {
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
      ...NegativePromptCategoryContextFragment
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
    NegativePromptCategoryContextFragment,
  ],
)
