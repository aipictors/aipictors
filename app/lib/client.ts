import { config } from "~/config"
import {
  ApolloClient,
  InMemoryCache,
  type TypePolicies,
  createHttpLink,
} from "@apollo/client/index"
import { type ContextSetter, setContext } from "@apollo/client/link/context"
import { getApps } from "firebase/app"
import { getAuth, getIdToken } from "firebase/auth"

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      works: {
        /*
         * keyArgs で “where が同じなら同じキャッシュキー” にまとめる。
         * offset / limit は無視して 1 つの配列に集約。
         */
        keyArgs: ["where"],

        /*
         * merge で “足し込み” ロジックを実装。
         * 既存配列（ページ 0）に offset 位置から incoming を上書き。
         */
        // TODO: リファクタ
        // biome-ignore lint/style/useDefaultParameterLast: <explanation>
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        merge(existing: any[] = [], incoming: any[], { args }) {
          const offset = args?.offset ?? 0
          const merged = existing.slice() // shallow copy
          for (let i = 0; i < incoming.length; ++i) {
            merged[offset + i] = incoming[i]
          }
          return merged
        },
      },
    },
  },
}

/* ---------- HTTP & Auth Link ---------- */
const httpLink = createHttpLink({ uri: config.graphql.endpoint })

const contextSetter: ContextSetter = async (_, context) => {
  if (getApps().length === 0) {
    return {
      headers: { ...context.headers, authorization: null, platform: "web" },
    }
  }

  const currentUser = getAuth().currentUser
  if (currentUser === null) {
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

/* ---------- In-Memory Cache ---------- */
const cache = new InMemoryCache({ typePolicies })

/* ---------- Apollo Client ---------- */
export const apolloClient = new ApolloClient({
  ssrMode: false,
  link: authLink.concat(httpLink),
  cache,

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network", // 初回はネット越し
      nextFetchPolicy: "cache-first", // “戻る” 時はキャッシュ優先
    },
  },
})
