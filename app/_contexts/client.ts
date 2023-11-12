import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { typePolicies } from "app/_contexts/type-policies"
import { Config } from "config"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"

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

export const createClient = () => {
  const cache = new InMemoryCache({
    typePolicies: typePolicies,
  })

  return new ApolloClient({
    ssrMode: true,
    link: authLink.concat(httpLink),
    cache: cache,
  })
}
