import { ApolloLink, type FetchResult, Observable } from "@apollo/client/index"
import { getMainDefinition } from "@apollo/client/utilities"
import { hasTransientGraphQLError } from "~/lib/transient-graphql-error"

const MAX_RETRIES = 2

const isQuery = (operation: Parameters<typeof getMainDefinition>[0]) => {
  const definition = getMainDefinition(operation)
  return (
    definition.kind === "OperationDefinition" &&
    definition.operation === "query"
  )
}

const delayFor = (attempt: number) => 500 * 2 ** attempt + Math.random() * 500

/**
 * 読み取りが一時的に失敗したら、少し待って取り直す（書き込みは二重になるので再試行しない）。
 * 再試行しないと、取れなかった部分（作者の情報など）が欠けたまま表示される
 */
export const retryQueryLink = new ApolloLink((operation, forward) => {
  if (!isQuery(operation.query)) return forward(operation)

  return new Observable<FetchResult>((observer) => {
    let subscription: { unsubscribe(): void } | null = null
    let timer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    const retryLater = () => {
      timer = setTimeout(run, delayFor(attempt))
      attempt += 1
    }

    const run = () => {
      subscription = forward(operation).subscribe({
        next(result) {
          if (
            attempt < MAX_RETRIES &&
            hasTransientGraphQLError(result.errors)
          ) {
            subscription?.unsubscribe()
            retryLater()
            return
          }
          observer.next(result)
          observer.complete()
        },
        error(error) {
          if (attempt < MAX_RETRIES) {
            retryLater()
            return
          }
          observer.error(error)
        },
      })
    }

    run()

    return () => {
      if (timer !== null) clearTimeout(timer)
      subscription?.unsubscribe()
    }
  })
})
