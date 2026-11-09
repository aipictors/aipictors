import { describe, expect, test } from "bun:test"
import { readNextFeedPage } from "./use-feed-load-more"
import { NO_PROGRESS_RETRY_MS, shouldLoadMore } from "./use-infinite-scroll"

const page = (length: number) => Array.from({ length }, (_, id) => ({ id }))

describe("readNextFeedPage", () => {
  test("1 ページ分あれば続きがあり、受け取った数だけ進める", async () => {
    const result = await readNextFeedPage({
      offset: 32,
      perPage: 32,
      fetchPage: async () => page(32),
      appendPage: () => 22,
    })
    expect(result).toEqual({ nextOffset: 64, isEnded: false })
  })

  test("1 ページに満たなければ最後のページ", async () => {
    const result = await readNextFeedPage({
      offset: 32,
      perPage: 32,
      fetchPage: async () => page(5),
      appendPage: (posts) => posts.length,
    })
    expect(result).toEqual({ nextOffset: 37, isEnded: true })
  })

  test("空なら最後のページで、読み足さない", async () => {
    const result = await readNextFeedPage({
      offset: 64,
      perPage: 32,
      fetchPage: async () => [],
      appendPage: () => 0,
    })
    expect(result).toEqual({ nextOffset: 64, isEnded: true })
  })

  test("全部表示済みなら次のページを読み、それでも増えなければ止める", async () => {
    const offsets: number[] = []
    const result = await readNextFeedPage({
      offset: 0,
      perPage: 32,
      fetchPage: async (offset) => {
        offsets.push(offset)
        return page(32)
      },
      appendPage: () => 0,
    })
    expect(offsets).toEqual([0, 32, 64])
    expect(result).toEqual({ nextOffset: 96, isEnded: true })
  })

  test("読めなかったら失敗を返す（最後のページにしない）", async () => {
    await expect(
      readNextFeedPage({
        offset: 0,
        perPage: 32,
        fetchPage: async () => {
          throw new Error("failed")
        },
        appendPage: () => 0,
      }),
    ).rejects.toThrow("failed")
  })
})

describe("shouldLoadMore", () => {
  const base = { sentinelTop: 1000, lastLoadedAt: 10_000 }

  test("最初は読む", () => {
    expect(shouldLoadMore({ ...base, lastSentinelTop: null, now: 10_000 })).toBe(
      true,
    )
  })

  test("一覧が伸びて目印が動いたらすぐ読む", () => {
    expect(
      shouldLoadMore({ ...base, lastSentinelTop: 400, now: 10_001 }),
    ).toBe(true)
  })

  test("目印が動いていない間は連続で読まない", () => {
    expect(
      shouldLoadMore({ ...base, lastSentinelTop: 1000, now: 10_100 }),
    ).toBe(false)
  })

  test("間隔が空けば読み直せる", () => {
    expect(
      shouldLoadMore({
        ...base,
        lastSentinelTop: 1000,
        now: 10_000 + NO_PROGRESS_RETRY_MS,
      }),
    ).toBe(true)
  })
})
