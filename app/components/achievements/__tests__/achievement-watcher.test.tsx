import { beforeEach, expect, mock, test } from "bun:test"
import { act, render, screen } from "@testing-library/react"

type Unlocked = {
  key: string
  name: string
  enName: string
  description: string
  enDescription: string
  tier: number
  isHidden: boolean
  rewardCoins: number
  unlockedAt: number
}

const item = (key: string, tier = 1): Unlocked => ({
  key,
  name: `実績 ${key}`,
  enName: key,
  description: "説明",
  enDescription: "description",
  tier,
  isHidden: false,
  rewardCoins: 10,
  unlockedAt: 0,
})

let checkResult: { isInitialSync: boolean; unlocked: Unlocked[] } = {
  isInitialSync: false,
  unlocked: [],
}
const checkCalls: { force: boolean }[] = []
const seenCalls: string[][] = []

mock.module("@apollo/client/index", () => ({
  useMutation: (document: { definitions: { name?: { value: string } }[] }) => {
    const name = document.definitions[0]?.name?.value
    if (name === "CheckAchievements") {
      return [
        async (options: { variables: { force: boolean } }) => {
          checkCalls.push(options.variables)
          return {
            data: {
              checkAchievements: { ...checkResult, grantedCoins: 0 },
            },
          }
        },
      ]
    }
    return [
      async (options: { variables: { keys: string[] } }) => {
        seenCalls.push(options.variables.keys)
        return { data: { markAchievementsSeen: true } }
      },
    ]
  },
}))

mock.module("@remix-run/react", () => ({
  useLocation: () => ({ pathname: "/" }),
  useNavigate: () => () => undefined,
}))

mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

const { AuthContext } = await import("~/contexts/auth-context")
const { AchievementWatcher } = await import(
  "~/components/achievements/achievement-watcher"
)
const { requestAchievementCheck } = await import(
  "~/lib/achievements/achievement-ui"
)

const renderWatcher = () =>
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
      <AchievementWatcher />
    </AuthContext.Provider>,
  )

const flush = () =>
  act(async () => await new Promise((resolve) => setTimeout(resolve, 0)))

beforeEach(() => {
  checkCalls.length = 0
  seenCalls.length = 0
  checkResult = { isInitialSync: false, unlocked: [] }
  document.body.innerHTML = ""
})

test("開いたときに確かめ、達成したものを 1 件ずつ古い順に出して、見せたものを既読にする", async () => {
  checkResult = {
    isInitialSync: false,
    unlocked: [item("works-3"), item("works-1")],
  }
  renderWatcher()
  await flush()
  expect(checkCalls).toEqual([{ force: false }])
  expect(screen.getByText("実績 works-1")).toBeTruthy()
  expect(screen.getByText("ほか 1 件")).toBeTruthy()
  expect(seenCalls).toEqual([["works-1"]])
})

test("はじめての確認でまとめて達成したときは、一覧のダイアログで見せる", async () => {
  checkResult = {
    isInitialSync: true,
    unlocked: ["a", "b", "c", "d", "e"].map((key) => item(key)),
  }
  renderWatcher()
  await flush()
  expect(screen.getByText("これまでの実績 5 個を達成しました！")).toBeTruthy()
  expect(seenCalls).toEqual([["a", "b", "c", "d", "e"]])
})

test("いいねなどのあとは少し待ってから、間隔をあけずに確かめる", async () => {
  renderWatcher()
  await flush()
  checkCalls.length = 0
  requestAchievementCheck()
  requestAchievementCheck()
  await act(
    async () => await new Promise((resolve) => setTimeout(resolve, 1600)),
  )
  expect(checkCalls).toEqual([{ force: true }])
})
