import { describe, expect, test } from "bun:test"
import { InMemoryCache } from "@apollo/client/index"
import { parse } from "graphql"
import {
  evictViewerFilteredLists,
  isViewerFilterMutation,
} from "~/lib/viewer-filter-cache"

describe("isViewerFilterMutation", () => {
  test("ミュート・ブロック・表示設定のミューテーションを検出する", () => {
    for (const field of [
      "muteUser",
      "unmuteUser",
      "blockUser",
      "unblockUser",
      "updateUserSetting",
    ]) {
      const document = parse(`mutation M { ${field}(input: {}) { id } }`)
      expect(isViewerFilterMutation(document)).toBe(true)
    }
  })

  test("それ以外のミューテーションやクエリは対象外", () => {
    expect(
      isViewerFilterMutation(
        parse("mutation M { createWorkLike(input: {}) { id } }"),
      ),
    ).toBe(false)
    expect(isViewerFilterMutation(parse("query Q { muteUser { id } }"))).toBe(
      false,
    )
  })
})

describe("evictViewerFilteredLists", () => {
  test("作品一覧とフィードの投稿キャッシュだけを破棄する", () => {
    const cache = new InMemoryCache()

    cache.restore({
      ROOT_QUERY: {
        __typename: "Query",
        'works({"limit":32,"offset":0})': [],
        hotWorks: [],
        viewer: { __ref: "Viewer:1" },
      },
      "Viewer:1": { __typename: "Viewer", id: "1" },
      "FeedNode:1": {
        __typename: "FeedNode",
        id: "1",
        'posts({"limit":32,"offset":0})': [],
      },
    })

    evictViewerFilteredLists(cache)

    const snapshot = cache.extract() as Record<string, Record<string, unknown>>

    expect(
      Object.keys(snapshot.ROOT_QUERY).some((key) => key.startsWith("works")),
    ).toBe(false)
    expect(snapshot.ROOT_QUERY.hotWorks).toBeUndefined()
    expect(snapshot.ROOT_QUERY.viewer).toEqual({ __ref: "Viewer:1" })
    expect(
      Object.keys(snapshot["FeedNode:1"] ?? {}).some((key) =>
        key.startsWith("posts"),
      ),
    ).toBe(false)
  })
})
