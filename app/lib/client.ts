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

import { typePolicies } from "~/lib/type-policies"
import { config } from "~/config"
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  type NormalizedCacheObject,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"

const httpLink = createHttpLink({
  uri: config.graphql.endpoint,
})

const contextSetter: ContextSetter = async (_, context) => {
  if (getApps().length === 0) {
    return {
      headers: { ...context.headers, authorization: null, platform: "web" },
    }
  }

  const currentUser = getAuth().currentUser
  if (!currentUser) {
    return {
      headers: { ...context.headers, authorization: null, platform: "web" },
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

const cache = new InMemoryCache({ typePolicies })

export const apolloClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    ssrMode: false,
    link: authLink.concat(httpLink),
    cache,
  })
