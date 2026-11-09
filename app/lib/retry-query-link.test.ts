import { describe, expect, test } from "bun:test"
import { ApolloLink, execute, gql, Observable } from "@apollo/client/index"
import { retryQueryLink } from "~/lib/retry-query-link"
import { hasTransientGraphQLError } from "~/lib/transient-graphql-error"

const run = (query: ReturnType<typeof gql>, responses: object[]) => {
  let calls = 0
  const terminal = new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.next(responses[Math.min(calls, responses.length - 1)])
        calls += 1
        observer.complete()
      }),
  )
  return new Promise<{ calls: number; result: any }>((resolve) => {
    execute(retryQueryLink.concat(terminal), { query }).subscribe({
      next: (result) => resolve({ calls, result }),
    })
  })
}

const overloaded = { errors: [{ message: "D1 DB is overloaded." }] }

describe("retryQueryLink", () => {
  test("一時的な失敗の読み取りは取り直す", async () => {
    const { calls, result } = await run(gql`query A { a }`, [
      overloaded,
      { data: { a: 1 } },
    ])
    expect(calls).toBe(2)
    expect(result.data.a).toBe(1)
  })

  test("書き込みは再試行しない", async () => {
    const { calls } = await run(gql`mutation B { b }`, [overloaded])
    expect(calls).toBe(1)
  })
})

describe("hasTransientGraphQLError", () => {
  test("権限エラーなどは対象にしない", () => {
    expect(hasTransientGraphQLError([{ message: "権限がありません" }])).toBe(
      false,
    )
    expect(
      hasTransientGraphQLError([
        { message: "システム内部でエラーが発生しました。" },
      ]),
    ).toBe(true)
  })
})
