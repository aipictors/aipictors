import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from "@apollo/client/index"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { LikeButton } from "~/components/like-button"
import { AuthContext } from "~/contexts/auth-context"

const renderButton = (options: {
  workId: string
  userId: string | null
  ownerId?: string
  defaultLiked?: boolean
  serverLiked?: boolean
  cache?: InMemoryCache
}) => {
  const requests: string[][] = []
  const link = new ApolloLink((operation) => {
    const ids: string[] = operation.variables.where.ids
    requests.push(ids)
    return new Observable((observer) => {
      observer.next({
        data: {
          works: ids.map((id) => ({
            __typename: "WorkNode",
            id,
            isLiked: options.serverLiked ?? false,
          })),
        },
      })
      observer.complete()
    })
  })
  const client = new ApolloClient({
    cache: options.cache ?? new InMemoryCache(),
    link,
  })
  const auth = {
    isLoading: false,
    isLoggedIn: options.userId !== null,
    isNotLoggedIn: options.userId === null,
    userId: options.userId,
  }
  render(
    <MemoryRouter>
      <ApolloProvider client={client}>
        <AuthContext.Provider value={auth as never}>
          <LikeButton
            targetWorkId={options.workId}
            targetWorkOwnerUserId={options.ownerId ?? "owner"}
            defaultLiked={options.defaultLiked ?? false}
            defaultLikedCount={0}
          />
        </AuthContext.Provider>
      </ApolloProvider>
    </MemoryRouter>,
  )
  return requests
}

const isPressed = () =>
  screen.getByRole("button", { name: "いいね" }).getAttribute("aria-pressed")

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe("いいねボタンの状態", () => {
  test("未ログインとして取得した一覧でも、いいね済みなら赤くする", async () => {
    const requests = renderButton({
      workId: "1001",
      userId: "viewer",
      serverLiked: true,
    })
    await waitFor(() => expect(isPressed()).toBe("true"))
    expect(requests).toEqual([["1001"]])
  })

  test("いいねしていなければ白のまま", async () => {
    const requests = renderButton({
      workId: "1002",
      userId: "viewer",
      serverLiked: false,
    })
    await waitFor(() => expect(requests).toEqual([["1002"]]))
    expect(isPressed()).toBe("false")
  })

  test("端末に残った古い状態よりサーバーを優先する", async () => {
    localStorage.setItem(
      "work_like_1003",
      JSON.stringify({ liked: false, count: 0 }),
    )
    renderButton({
      workId: "1003",
      userId: "viewer",
      defaultLiked: true,
      serverLiked: true,
    })
    await waitFor(() => expect(isPressed()).toBe("true"))
    expect(localStorage.getItem("work_like_1003")).toBeNull()
  })

  test("ブラウザで取得済みの作品は問い合わせない", async () => {
    const cache = new InMemoryCache()
    cache.writeFragment({
      id: "WorkNode:1004",
      fragment: (await import("graphql")).parse(
        "fragment F on WorkNode { isLiked }",
      ),
      data: { __typename: "WorkNode", isLiked: true },
    })
    const requests = renderButton({
      workId: "1004",
      userId: "viewer",
      cache,
    })
    await waitFor(() => expect(isPressed()).toBe("true"))
    expect(requests).toEqual([])
  })

  test("未ログインなら問い合わせない", async () => {
    const requests = renderButton({ workId: "1005", userId: null })
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(requests).toEqual([])
  })

  test("自分の作品は問い合わせない", async () => {
    const requests = renderButton({
      workId: "1006",
      userId: "viewer",
      ownerId: "viewer",
    })
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(requests).toEqual([])
  })
})
