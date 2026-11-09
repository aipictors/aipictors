// ---------------------------------------------
// 開発時に Apollo の詳細エラーを出す
// ---------------------------------------------
if (import.meta.env.DEV) {
  import("@apollo/client/dev").then(
    ({ loadDevMessages, loadErrorMessages }) => {
      loadDevMessages()
      loadErrorMessages()
    },
  )
}

import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
  split,
} from "@apollo/client/index"
import { BatchHttpLink } from "@apollo/client/link/batch-http"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import { getMainDefinition } from "@apollo/client/utilities"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"
import { config } from "~/config"
import { retryQueryLink } from "~/lib/retry-query-link"
import { typePolicies } from "~/lib/type-policies"
import {
  evictViewerFilteredLists,
  isViewerFilterMutation,
} from "~/lib/viewer-filter-cache"

const singleHttpLink = createHttpLink({
  uri: config.graphql.endpoint,
})

/**
 * ログイン中の読み取りは、同時に出たものを 1 回の通信にまとめる
 * （ページを開くと 20 件ほど並ぶ。まとめるとサーバー側で同じ行の問い合わせも 1 回で済む）
 */
const batchHttpLink = new BatchHttpLink({
  uri: config.graphql.endpoint,
  batchInterval: 20,
  batchMax: 10,
})

const isBatchable = (operation: Parameters<typeof getMainDefinition>[0]) => {
  const definition = getMainDefinition(operation)
  return (
    definition.kind === "OperationDefinition" &&
    definition.operation === "query"
  )
}

// 未ログインの問い合わせは 1 件ずつの結果をサーバーでキャッシュしているのでまとめない
const httpLink = split(
  (operation) =>
    Boolean(operation.getContext().headers?.authorization) &&
    isBatchable(operation.query),
  batchHttpLink,
  singleHttpLink,
)

const contextSetter: ContextSetter = async (_, context) => {
  if (getApps().length === 0) {
    return {
      headers: { ...context.headers, platform: "web" },
    }
  }

  const currentUser = getAuth().currentUser
  if (!currentUser) {
    return {
      headers: { ...context.headers, platform: "web" },
    }
  }

  const token = await getIdToken(currentUser)

  return {
    headers: {
      ...context.headers,
      authorization: `Bearer ${token}`,
      platform: "web",
    },
  }
}

const authLink = setContext(contextSetter)

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (!import.meta.env.DEV) return

  if (graphQLErrors && graphQLErrors.length > 0) {
    console.error("[Apollo][GraphQL error]", {
      operation: operation.operationName,
      variables: operation.variables,
      errors: graphQLErrors,
    })
  }

  if (networkError) {
    const anyError = networkError as unknown as {
      name?: string
      message?: string
      statusCode?: number
      response?: unknown
      bodyText?: string
    }

    console.error("[Apollo][Network error]", {
      operation: operation.operationName,
      variables: operation.variables,
      name: anyError.name,
      message: anyError.message,
      statusCode: anyError.statusCode,
      bodyText: anyError.bodyText,
    })
  }
})

const cache = new InMemoryCache({ typePolicies })

/**
 * ミュート・ブロック・表示設定の変更後に作品一覧のキャッシュを破棄する
 */
const viewerFilterLink = new ApolloLink((operation, forward) => {
  if (!isViewerFilterMutation(operation.query)) {
    return forward(operation)
  }

  return forward(operation).map((result) => {
    if (!result.errors || result.errors.length === 0) {
      evictViewerFilteredLists(cache)
    }
    return result
  })
})

export const apolloClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    ssrMode: false,
    link: errorLink
      .concat(viewerFilterLink)
      .concat(retryQueryLink)
      .concat(authLink)
      .concat(httpLink),
    cache,
  })
