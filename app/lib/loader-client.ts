import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  type NormalizedCacheObject,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { config } from "~/config"

const httpLink = createHttpLink({
  uri: config.graphql.endpoint,
  fetch: async (uri, options) => {
    const response = await fetch(uri, options)

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
  },
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
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({}),
    // Worker の isolate が生きている間ずっと前の結果を返していた（作品を更新しても数分〜10 分古いまま）。
    // 使い回しはページ単位の拠点キャッシュ（app/lib/edge-page-cache.ts）で行う
    defaultOptions: {
      query: { fetchPolicy: "no-cache" },
      watchQuery: { fetchPolicy: "no-cache" },
    },
  })
