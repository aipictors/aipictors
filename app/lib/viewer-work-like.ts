import type { ApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"

/** 一度に確かめる作品の数 */
const BATCH_SIZE = 60

/** 同じ画面に並ぶいいねボタンを 1 回の問い合わせにまとめる待ち時間 */
const BATCH_WAIT_MS = 30

type Client = ApolloClient<object>

let knownUserId: string | null = null
const knownLikes = new Map<string, boolean>()
const waiting = new Map<string, Array<(liked: boolean | null) => void>>()
let timer: ReturnType<typeof setTimeout> | null = null

const selectKnownUser = (userId: string) => {
  if (knownUserId === userId) return
  knownUserId = userId
  knownLikes.clear()
}

/**
 * 押した結果を覚える（問い合わせ中でも押した結果を優先する）
 */
export const rememberViewerWorkLike = (
  userId: string,
  workId: string,
  liked: boolean,
) => {
  selectKnownUser(userId)
  knownLikes.set(workId, liked)
}

const flush = async (client: Client, userId: string) => {
  timer = null
  const workIds = [...waiting.keys()]
  const batches: string[][] = []
  for (let i = 0; i < workIds.length; i += BATCH_SIZE) {
    batches.push(workIds.slice(i, i + BATCH_SIZE))
  }
  await Promise.all(
    batches.map(async (ids) => {
      const callbacks = ids.map((id) => [id, waiting.get(id) ?? []] as const)
      for (const id of ids) waiting.delete(id)
      const fetched = new Map<string, boolean>()
      try {
        const resp = await client.query({
          query: viewerWorkLikesQuery,
          variables: {
            limit: ids.length,
            // 指定しないと R18 の作品が返らない
            where: { ids, ratings: ["G", "R15", "R18", "R18G"] },
          },
          fetchPolicy: "no-cache",
        })
        for (const work of resp.data.works) {
          fetched.set(work.id, work.isLiked)
        }
      } catch (error) {
        // 確かめられなければ今の表示のままにする
        console.error("Error fetching viewer work likes", error)
      }
      for (const [id, resolvers] of callbacks) {
        if (knownUserId === userId && !knownLikes.has(id)) {
          const liked = fetched.get(id)
          if (liked !== undefined) knownLikes.set(id, liked)
        }
        const result =
          knownUserId === userId ? (knownLikes.get(id) ?? null) : null
        for (const resolve of resolvers) resolve(result)
      }
    }),
  )
}

/**
 * ログイン中のユーザーがその作品にいいねしているかを返す。分からなければ null
 */
export const fetchViewerWorkLike = (
  client: Client,
  userId: string,
  workId: string,
): Promise<boolean | null> => {
  selectKnownUser(userId)
  const known = knownLikes.get(workId)
  if (known !== undefined) return Promise.resolve(known)

  // ブラウザでログイン後に取得した一覧の分は既に分かっている
  const cached = client.cache.readFragment({
    id: client.cache.identify({ __typename: "WorkNode", id: workId }),
    fragment: viewerWorkLikeFragment,
  })
  if (cached) {
    knownLikes.set(workId, cached.isLiked)
    return Promise.resolve(cached.isLiked)
  }

  return new Promise((resolve) => {
    waiting.set(workId, [...(waiting.get(workId) ?? []), resolve])
    if (timer === null) {
      timer = setTimeout(() => flush(client, userId), BATCH_WAIT_MS)
    }
  })
}

const viewerWorkLikeFragment = graphql(
  `fragment ViewerWorkLike on WorkNode @_unmask {
    isLiked
  }`,
)

const viewerWorkLikesQuery = graphql(
  `query ViewerWorkLikes($limit: Int!, $where: WorksWhereInput!) {
    works(offset: 0, limit: $limit, where: $where) {
      id
      isLiked
    }
  }`,
)
