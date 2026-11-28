import { beforeEach, describe, expect, test } from "bun:test"
import { logWorkView } from "~/hooks/use-count-work-view"
import {
  peekEventLogQueueForTest,
  resetEventLogForTest,
} from "~/utils/event-log"

describe("logWorkView", () => {
  beforeEach(() => {
    // happy-dom は自動操作のブラウザ扱い（webdriver = true）なので外す
    Object.defineProperty(navigator, "webdriver", {
      value: false,
      configurable: true,
    })
    resetEventLogForTest()
    window.sessionStorage.clear()
    window.__aipEv = undefined
  })

  test("作品ページとダイアログを source で分け、作品 ID を数値で積む", () => {
    logWorkView("281302", "page")
    logWorkView("28928", "dialog")
    const queue = peekEventLogQueueForTest()
    expect(queue.map((item) => [item.e, item.s, item.n])).toEqual([
      ["work_view", "page", 281302],
      ["work_view", "dialog", 28928],
    ])
    expect(queue[0]?.x).toBe('{"work":281302}')
  })

  test("作品 ID でない値は積まない", () => {
    logWorkView("", "page")
    logWorkView("abc", "dialog")
    logWorkView("-1", "page")
    expect(peekEventLogQueueForTest()).toEqual([])
  })
})
