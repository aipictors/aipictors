import { afterAll, beforeEach, expect, test } from "bun:test"
import { replayPendingClick } from "./replay-pending-click"

type TestWindow = {
  __aipictorsHydrated?: boolean
  __aipictorsPendingClick?: { el: unknown; at: number }
}

const testWindow = {} as TestWindow

beforeEach(() => {
  testWindow.__aipictorsHydrated = undefined
  testWindow.__aipictorsPendingClick = undefined
  ;(globalThis as unknown as { window: TestWindow }).window = testWindow
})

// 他のテストが使う window はそのまま戻す
const originalWindow = globalThis.window
afterAll(() => {
  ;(globalThis as unknown as { window: unknown }).window = originalWindow
})

const toButton = (isConnected = true) => {
  const button = {
    isConnected,
    count: 0,
    click() {
      button.count += 1
    },
  }
  return button
}

test("hydration 前に押されたボタンを 1 回だけ押し直す", () => {
  const button = toButton()
  testWindow.__aipictorsPendingClick = { el: button, at: 1000 }
  expect(replayPendingClick(2000)).toBe(true)
  expect(button.count).toBe(1)
  expect(testWindow.__aipictorsHydrated).toBe(true)
  expect(replayPendingClick(2000)).toBe(false)
  expect(button.count).toBe(1)
})

test("古いものと、もう画面にないものは押し直さない", () => {
  const old = toButton()
  testWindow.__aipictorsPendingClick = { el: old, at: 1000 }
  expect(replayPendingClick(9001)).toBe(false)
  expect(old.count).toBe(0)
  const removed = toButton(false)
  testWindow.__aipictorsPendingClick = { el: removed, at: 1000 }
  expect(replayPendingClick(2000)).toBe(false)
  expect(removed.count).toBe(0)
})
