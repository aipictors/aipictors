import { describe, expect, test } from "bun:test"
import { searchWorkIdsByText } from "~/lib/server/work-text-search.server"

const createDb = (ids: number[], rowsRead = 0) => {
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
                meta: { rows_read: rowsRead },
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

  const createKv = () => {
    const puts: { key: string; ttl: number }[] = []
    return {
      puts,
      kv: {
        get: async () => null,
        put: async (
          key: string,
          _value: string,
          options: { expirationTtl: number },
        ) => {
          puts.push({ key, ttl: options.expirationTtl })
        },
      },
    }
  }

  test("3 文字以上で読んだ行数が多い結果は KV に 6 時間置く", async () => {
    const { db } = createDb([1, 2, 3], 240_000)
    const { kv, puts } = createKv()
    await searchWorkIdsByText({
      db,
      kv: kv as never,
      query: "女の子",
      rating: "G",
      offset: 0,
      limit: 30,
    })
    expect(puts.length).toBe(1)
    expect(puts[0].ttl).toBe(60 * 60 * 6)
  })

  test("3 文字以上で読んだ行数が少ない結果は KV に置かない", async () => {
    const { db } = createDb([1, 2, 3], 120)
    const { kv, puts } = createKv()
    await searchWorkIdsByText({
      db,
      kv: kv as never,
      query: "ねこの絵",
      rating: "G",
      offset: 0,
      limit: 30,
    })
    expect(puts.length).toBe(0)
  })
})
