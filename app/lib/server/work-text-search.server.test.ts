import { describe, expect, test } from "bun:test"
import { searchWorkIdsByText } from "~/lib/server/work-text-search.server"

const createDb = (ids: number[]) => {
  const calls: { sql: string; params: unknown[] }[] = []
  const db = {
    prepare(sql: string) {
      return {
        bind(...params: unknown[]) {
          return {
            all: async () => {
              calls.push({ sql, params })
              return {
                results: ids
                  .slice(0, params.at(-2) as number)
                  .map((id) => ({ id })),
              }
            },
            first: async () => {
              calls.push({ sql, params })
              return { c: ids.length }
            },
          }
        },
      }
    },
  }
  return { db: db as never, calls }
}

describe("searchWorkIdsByText", () => {
  test("件数とページを 1 回の問い合わせから返す", async () => {
    const { db, calls } = createDb(Array.from({ length: 95 }, (_, i) => i + 1))
    const result = await searchWorkIdsByText({
      db,
      query: "猫",
      rating: "G",
      offset: 30,
      limit: 30,
    })
    expect(calls.length).toBe(1)
    expect(result.count).toBe(95)
    expect(result.ids[0]).toBe("31")
    expect(result.ids.length).toBe(30)
  })

  test("上限より深いページは毎回問い合わせる", async () => {
    const { db, calls } = createDb([1, 2, 3])
    await searchWorkIdsByText({
      db,
      query: "ねこの絵",
      rating: "G",
      offset: 990,
      limit: 30,
    })
    expect(calls.length).toBe(2)
  })

  test("2 文字以下の深いページは全件を読まない", async () => {
    const { db, calls } = createDb([1, 2, 3])
    const result = await searchWorkIdsByText({
      db,
      query: "猫",
      rating: "G",
      offset: 990,
      limit: 30,
    })
    expect(calls.length).toBe(0)
    expect(result.ids).toEqual([])
  })
})
