import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from "@apollo/client/index"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { DialogLikeButton } from "~/components/work/dialog-like-button"
import { AuthContext } from "~/contexts/auth-context"

const renderButton = (options: {
  workId: string
  userId: string | null
  ownerId?: string
  defaultLiked?: boolean
  serverLiked?: boolean
  operations?: { name: string; keepalive: unknown }[]
}) => {
  const link = new ApolloLink((operation) => {
    if (operation.variables.input !== undefined) {
      options.operations?.push({
        name: operation.operationName,
        keepalive: operation.getContext().fetchOptions?.keepalive,
      })
      return new Observable((observer) => {
        observer.next({ data: { [operation.operationName]: null } })
        observer.complete()
      })
    }
    const ids: string[] | undefined = operation.variables.where?.ids
    if (ids === undefined) {
      return new Observable((observer) => {
        observer.next({ data: {} })
        observer.complete()
      })
    }
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
  const client = new ApolloClient({ cache: new InMemoryCache(), link })
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
          <DialogLikeButton
            countLabel=""
            targetWorkId={options.workId}
            targetWorkOwnerUserId={options.ownerId ?? "owner"}
            defaultLiked={options.defaultLiked ?? false}
            defaultLikedCount={0}
          />
        </AuthContext.Provider>
      </ApolloProvider>
    </MemoryRouter>,
  )
}

const isLiked = () =>
  screen.getByRole("button").className.includes("bg-pink-50/80")

beforeEach(async () => {
  localStorage.clear()
  // 先に動いたテストが残したまとめ問い合わせを流してから始める
  await new Promise((resolve) => setTimeout(resolve, 60))
})
afterEach(cleanup)

describe("ダイアログのいいねボタン", () => {
  test("未ログインとして取得した一覧から開いても、いいね済みなら赤くする", async () => {
    renderButton({ workId: "3001", userId: "viewer", serverLiked: true })
    await waitFor(() => expect(isLiked()).toBe(true))
  })

  test("いいね済みの作品を押すと取り消しになり、いいねを二重に作らない", async () => {
    const operations: { name: string; keepalive: unknown }[] = []
    renderButton({
      workId: "3002",
      userId: "viewer",
      serverLiked: true,
      operations,
    })
    await waitFor(() => expect(isLiked()).toBe(true))
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => expect(operations).toHaveLength(1))
    expect(operations[0].name).toBe("DeleteWorkLike")
  })

  test("いいねしていなければ白のまま", async () => {
    renderButton({ workId: "3003", userId: "viewer", serverLiked: false })
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(isLiked()).toBe(false)
  })

  test("押した直後にページを離れても送信が続くようにする", async () => {
    const operations: { name: string; keepalive: unknown }[] = []
    renderButton({ workId: "3004", userId: "viewer", operations })
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => expect(operations).toHaveLength(1))
    expect(operations[0]).toEqual({
      name: "CreateWorkLike",
      keepalive: true,
    })
  })
})
