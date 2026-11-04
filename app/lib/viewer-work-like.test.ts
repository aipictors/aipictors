import { describe, expect, mock, test } from "bun:test"
import type { ApolloClient } from "@apollo/client/index"
import { InMemoryCache } from "@apollo/client/index"
import {
  fetchViewerWorkLike,
  rememberViewerWorkLike,
} from "~/lib/viewer-work-like"

const createClient = (likes: Record<string, boolean>) => {
  const query = mock(
    async (options: { variables: { where: { ids: string[] } } }) => ({
      data: {
        works: options.variables.where.ids
          .filter((id) => id in likes)
          .map((id) => ({ id, isLiked: likes[id] })),
      },
    }),
  )
  const client = {
    cache: new InMemoryCache(),
    query,
  } as unknown as ApolloClient<object>
  return { client, query }
}

describe("fetchViewerWorkLike", () => {
  test("同じ画面のボタンを 1 回の問い合わせにまとめる", async () => {
    const { client, query } = createClient({ a1: true, a2: false })
    const results = await Promise.all([
      fetchViewerWorkLike(client, "u1", "a1"),
      fetchViewerWorkLike(client, "u1", "a2"),
    ])
    expect(results).toEqual([true, false])
    expect(query).toHaveBeenCalledTimes(1)
  })

  test("一度分かった作品はもう問い合わせない", async () => {
    const { client, query } = createClient({ b1: true })
    await fetchViewerWorkLike(client, "u2", "b1")
    await fetchViewerWorkLike(client, "u2", "b1")
    expect(query).toHaveBeenCalledTimes(1)
  })

  test("問い合わせ中に押したら押した結果を優先する", async () => {
    const { client } = createClient({ c1: false })
    const pending = fetchViewerWorkLike(client, "u3", "c1")
    rememberViewerWorkLike("u3", "c1", true)
    expect(await pending).toBe(true)
  })

  test("取れなかった作品は null（表示を変えない）", async () => {
    const { client } = createClient({})
    expect(await fetchViewerWorkLike(client, "u4", "d1")).toBeNull()
  })

  test("ユーザーが変わったら覚えている内容を使わない", async () => {
    const { client, query } = createClient({ e1: false })
    rememberViewerWorkLike("u5", "e1", true)
    expect(await fetchViewerWorkLike(client, "u6", "e1")).toBe(false)
    expect(query).toHaveBeenCalledTimes(1)
  })
})
