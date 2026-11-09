import {
  ApolloClient,
  ApolloError,
  createHttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { config } from "~/config"

const API_TIMEOUT_MS = 10_000

const httpLink = createHttpLink({
  uri: config.graphql.endpoint,
  // bun-types の typeof fetch は preconnect を要求するが、Workers の fetch にはない
  fetch: (async (uri: Parameters<typeof fetch>[0], options?: RequestInit) => {
    // API が応答しないときにページの描画ごと止めない
    const response = await fetch(uri, {
      ...options,
      signal: options?.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok && typeof window === "undefined") {
      const clonedResponse = response.clone()
      const responseText = await clonedResponse.text().catch(() => "")

      console.error("GraphQL request failed", {
        endpoint: typeof uri === "string" ? uri : uri.toString(),
        status: response.status,
        server: response.headers.get("server"),
        cfRay: response.headers.get("cf-ray"),
        responseText: responseText.slice(0, 400),
      })
    }

    return response
  }) as typeof fetch,
  // TODO: タイムアウトを設定する
  // fetchOptions: {
  //   signal: AbortSignal.timeout(2000),
  // },
})

const contextSetter: ContextSetter = async (_, context) => {
  return {
    headers: {
      ...context.headers,
      authorization: null,
      provider: "aipictors",
      platform: "web",
    },
  }
}

const authLink = setContext(contextSetter)

export const loaderClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    ssrMode: false,
    // isolate をまたいで同じ問い合わせをまとめると、別のリクエストの処理を待って止まる
    queryDeduplication: false,
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({}),
    // Worker の isolate が生きている間ずっと前の結果を返していた（作品を更新しても数分〜10 分古いまま）。
    // 使い回しはページ単位の拠点キャッシュ（app/lib/edge-page-cache.ts）で行う
    defaultOptions: {
      query: { fetchPolicy: "no-cache", errorPolicy: "all" },
      watchQuery: { fetchPolicy: "no-cache" },
    },
  })

const originalQuery = loaderClient.query.bind(loaderClient)

/**
 * 一部の項目だけ失敗しても（D1 の過負荷など）取れた分でページを出す。
 * 何も取れなかったときと、呼び出し側が errorPolicy を指定したときは今まで通り。
 */
loaderClient.query = (async (options: Parameters<typeof originalQuery>[0]) => {
  const result = await originalQuery(options)
  if (options.errorPolicy !== undefined || !result.errors?.length) {
    return result
  }
  const values = Object.values((result.data ?? {}) as Record<string, unknown>)
  if (values.every((value) => value === null || value === undefined)) {
    throw new ApolloError({ graphQLErrors: result.errors })
  }
  return result
}) as typeof loaderClient.query
