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
  createHttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"
import { config } from "~/config"
import { typePolicies } from "~/lib/type-policies"

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

export const apolloClient: ApolloClient<NormalizedCacheObject> =
  new ApolloClient({
    ssrMode: false,
    link: errorLink.concat(authLink).concat(httpLink),
    cache,
  })
