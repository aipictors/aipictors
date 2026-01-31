import { AuthContext } from "~/contexts/auth-context"
import { useFocusTimeout } from "~/hooks/use-focus-timeout"
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
} from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql, readFragment, type ResultOf } from "gql.tada"
import { startTransition, useContext, useEffect, useRef } from "react"

type Props = {
  children: React.ReactNode
  generationQueryContext: ResultOf<typeof GenerationQueryContextQuery>
}

/**
 * エディタに必要なデータを提供する
 * @param props
 */
export function GenerationQueryProvider (props: Props) {
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

  const inProgressImageGenerationReservedTasksCount =
    userStatus?.inProgressImageGenerationReservedTasksCount ?? 0

  const requestedStatusRefetchTimeoutsRef = useRef<
    Array<ReturnType<typeof setTimeout>>
  >([])

  const scheduleStatusRefetchBurst = () => {
    // 直前のバーストをクリア（連打時の無駄なrefetchを抑える）
    for (const timeoutId of requestedStatusRefetchTimeoutsRef.current) {
      clearTimeout(timeoutId)
    }
    requestedStatusRefetchTimeoutsRef.current = []

    // すぐの refetch はバックエンド反映前で古い値が返ることがあるため、
    // 数回バーストで再取得してUIを追従させる。
    const delays = [0, 1500, 4000, 8000]
    for (const delay of delays) {
      const timeoutId = setTimeout(() => {
        if (isTimeout) return
        startTransition(() => {
          refetch()
        })
      }, delay)
      requestedStatusRefetchTimeoutsRef.current.push(timeoutId)
    }
  }

  useEffect(() => {
    // 生成開始時に明示的に更新をかけるためのイベント
    const onRequested = () => {
      scheduleStatusRefetchBurst()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("generation:task-requested", onRequested)
      return () => {
        window.removeEventListener("generation:task-requested", onRequested)
      }
    }
    return
  }, [isTimeout, refetch])

  useEffect(() => {
    // 生成中/予約中の間だけ定期的にステータスを更新する
    const time = setInterval(() => {
      if (isTimeout) {
        return
      }
      const hasInProgress =
        inProgressImageGenerationTasksCount > 0 ||
        inProgressImageGenerationReservedTasksCount > 0
      if (!hasInProgress) {
        return
      }
      startTransition(() => {
        refetch()
      })
    }, 5000)
    return () => {
      clearInterval(time)
    }
  }, [
    isTimeout,
    inProgressImageGenerationTasksCount,
    inProgressImageGenerationReservedTasksCount,
    refetch,
  ])

  useEffect(() => {
    startTransition(() => {
      refetch()
    })
  }, [authContext.isLoggedIn])

  useEffect(() => {
    return () => {
      for (const timeoutId of requestedStatusRefetchTimeoutsRef.current) {
        clearTimeout(timeoutId)
      }
      requestedStatusRefetchTimeoutsRef.current = []
    }
  }, [])

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
