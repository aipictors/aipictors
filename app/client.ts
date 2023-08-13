import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { setContext, type ContextSetter } from "@apollo/client/link/context"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"
import { Config } from "config"

const httpLink = createHttpLink({
  uri: Config.graphqlEndpoint,
})

const contextSetter: ContextSetter = async (_, context) => {
  if (getApps().length === 0) {
    return {
      headers: {
        ...context.headers,
        authorization: null,
      },
    }
  }
  const currentUser = getAuth().currentUser
  if (currentUser === null) {
    return {
      headers: {
        ...context.headers,
        authorization: null,
      },
    }
  }
  const token = await getIdToken(currentUser, true)
  return {
    headers: {
      ...context.headers,
      authorization: `Bearer ${token}`,
    },
  }
}

const authLink = setContext(contextSetter)

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {},
    },
  },
})

export const client = new ApolloClient({
  ssrMode: true,
  link: authLink.concat(httpLink),
  cache: cache,
})
