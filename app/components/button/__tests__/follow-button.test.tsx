import { beforeEach, expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"

type MutateArgs = {
  mutation: { definitions: { name?: { value: string } }[] }
  variables: { input: { userId: string } }
}

/** サーバ（届いた順に記録し、resolve は手で行う） */
let calls: { name: string; resolve: () => void; reject: () => void }[] = []

const mutate = mock((args: MutateArgs) => {
  const name = args.mutation.definitions[0]?.name?.value ?? ""
  return new Promise((resolve, reject) => {
    calls.push({
      name,
      resolve: () =>
        resolve({
          data:
            name === "FollowUser"
              ? { followUser: { id: "2", isFollowee: true } }
              : { unfollowUser: { id: "2", isFollowee: false } },
        }),
      reject: () => reject(new Error("network")),
    })
  })
})

const modify = mock(() => true)

mock.module("@apollo/client/index", () => ({
  useApolloClient: () => ({
    mutate,
    cache: { identify: () => "UserNode:2", modify },
  }),
}))

const toastError = mock(() => undefined)
const toastDefault = Object.assign(
  mock(() => undefined),
  { error: toastError, success: () => undefined },
)
mock.module("sonner", () => ({ toast: toastDefault }))

mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

mock.module("~/components/login-dialog-button", () => ({
  LoginDialogButton: () => null,
}))

const { AuthContext } = await import("~/contexts/auth-context")
const { FollowButton } = await import("~/components/button/follow-button")

const renderButton = (isFollow: boolean) =>
  render(
    <AuthContext.Provider
      value={
        {
          isLoading: false,
          isLoggedIn: true,
          isNotLoggedIn: false,
          userId: "1",
        } as never
      }
    >
      <FollowButton targetUserId="2" isFollow={isFollow} />
    </AuthContext.Provider>,
  )

const flush = () => act(async () => await new Promise((r) => setTimeout(r, 0)))

beforeEach(() => {
  calls = []
  mutate.mockClear()
  modify.mockClear()
  toastError.mockClear()
})

test("押した瞬間にフォロー中になる（サーバの返事を待たない）", async () => {
  renderButton(false)
  fireEvent.click(screen.getByText("フォローする"))
  expect(screen.getByText("フォロー中")).toBeTruthy()
  expect(calls.map((c) => c.name)).toEqual(["FollowUser"])
  await act(async () => calls[0]?.resolve())
  await flush()
  expect(screen.getByText("フォロー中")).toBeTruthy()
  expect(modify).toHaveBeenCalledTimes(1)
})

test("解除は確認を出さずにすぐ解除し、元に戻すを出す", async () => {
  renderButton(true)
  fireEvent.click(screen.getByLabelText("フォロー中（押すと解除）"))
  expect(screen.getByText("フォローする")).toBeTruthy()
  expect(calls.map((c) => c.name)).toEqual(["UnfollowUser"])
  expect(toastDefault).toHaveBeenCalled()
})

test("返事を待つ間に連打しても、1 件ずつ送って最後に押した状態になる", async () => {
  renderButton(false)
  fireEvent.click(screen.getByText("フォローする"))
  fireEvent.click(screen.getByLabelText("フォロー中（押すと解除）"))
  fireEvent.click(screen.getByText("フォローする"))
  // 最初の 1 件の返事が来るまで次は送らない
  expect(calls).toHaveLength(1)
  await act(async () => calls[0]?.resolve())
  await flush()
  // フォロー済み → 最後に押したのもフォローなので、もう送らない
  expect(calls).toHaveLength(1)
  expect(screen.getByText("フォロー中")).toBeTruthy()
})

test("フォロー→解除と押したら、フォローの返事のあとに解除を送る", async () => {
  renderButton(false)
  fireEvent.click(screen.getByText("フォローする"))
  fireEvent.click(screen.getByLabelText("フォロー中（押すと解除）"))
  await act(async () => calls[0]?.resolve())
  await flush()
  expect(calls.map((c) => c.name)).toEqual(["FollowUser", "UnfollowUser"])
  await act(async () => calls[1]?.resolve())
  await flush()
  expect(screen.getByText("フォローする")).toBeTruthy()
})

test("失敗したら元に戻して知らせる", async () => {
  renderButton(false)
  fireEvent.click(screen.getByText("フォローする"))
  expect(screen.getByText("フォロー中")).toBeTruthy()
  await act(async () => calls[0]?.reject())
  await flush()
  expect(screen.getByText("フォローする")).toBeTruthy()
  expect(toastError).toHaveBeenCalledTimes(1)
  expect(modify).not.toHaveBeenCalled()
})
