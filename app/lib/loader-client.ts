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
  })
