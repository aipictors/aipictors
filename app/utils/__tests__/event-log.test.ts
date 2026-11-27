import { beforeEach, describe, expect, test } from "bun:test"
import {
  currentSessionId,
  logEvent,
  logPageView,
  peekEventLogQueueForTest,
  resetEventLogForTest,
  SESSION_IDLE_MS,
  SESSION_KEY,
  setEventLogUser,
  startEventLog,
  toExtra,
} from "~/utils/event-log"

describe("event-log", () => {
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

  test("セッション ID は 30 分操作がなければ新しくなる", () => {
    const now = 1_800_000_000_000
    const first = currentSessionId(now)
    expect(first).toMatch(/^[a-z0-9]{6,16}$/)
    expect(currentSessionId(now + 60_000)).toBe(first)
    expect(currentSessionId(now + 60_000 + SESSION_IDLE_MS + 1)).not.toBe(first)
    expect(window.sessionStorage.getItem(SESSION_KEY)).toContain(".")
  })

  test("source とほかの値を分けて積み、埋め込みの最初の表示も引き取る", () => {
    window.__aipEv = {
      sid: "abcdefgh",
      q: [{ e: "page_view", p: "/", r: "direct", t: 1 }],
    }
    logEvent("generate_error", { kind: "standard", reason: "coin_shortage" })
    logEvent("lowcoin_click", { source: "free" })
    logPageView("generation")
    const queue = peekEventLogQueueForTest()
    expect(window.__aipEv?.taken).toBe(true)
    expect(queue.map((item) => item.e)).toEqual([
      "page_view",
      "generate_error",
      "lowcoin_click",
      "page_view",
    ])
    expect(queue[1]?.x).toBe('{"kind":"standard","reason":"coin_shortage"}')
    expect(queue[2]?.s).toBe("free")
    expect(queue[2]?.x).toBeUndefined()
    expect(queue[3]?.r).toBe("nav:generation")
  })

  test("始めたら、何も操作がなくても最初の表示を隠れたときに送る", () => {
    const sent: string[] = []
    Object.defineProperty(navigator, "sendBeacon", {
      value: (_url: string, body: string) => {
        sent.push(body)
        return true
      },
      configurable: true,
    })
    window.__aipEv = {
      sid: "abcdefgh",
      q: [{ e: "page_view", p: "/", r: "direct", t: 1 }],
    }
    startEventLog()
    expect(window.__aipEv?.taken).toBe(true)
    window.dispatchEvent(new Event("pagehide"))
    expect(sent.length).toBe(1)
    expect(JSON.parse(sent[0] ?? "{}").ev[0].e).toBe("page_view")
  })

  test("数値は n にも入れる", () => {
    expect(toExtra({ coins: 30, item: "coins" })).toEqual({
      x: '{"coins":30,"item":"coins"}',
      n: 30,
    })
    expect(toExtra({ source: "x" })).toEqual({})
  })

  test("ユーザーが変わるときは前の人の分を送ってから", () => {
    const sent: string[] = []
    Object.defineProperty(navigator, "sendBeacon", {
      value: (_url: string, body: string) => {
        sent.push(body)
        return true
      },
      configurable: true,
    })
    setEventLogUser("1")
    logEvent("like", { source: "work" })
    expect(peekEventLogQueueForTest().length).toBe(1)
    setEventLogUser(null)
    expect(peekEventLogQueueForTest().length).toBe(0)
    const body = JSON.parse(sent[0] ?? "{}")
    expect(body.u).toBe("1")
    expect(body.a).toBe(1)
    expect(body.ev[0].e).toBe("like")
  })
})
