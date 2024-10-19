import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { config } from "~/config"

const httpLink = createHttpLink({
  uri: config.graphql.endpoint,
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

export const loaderClient = new ApolloClient({
  ssrMode: false,
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({}),
})
