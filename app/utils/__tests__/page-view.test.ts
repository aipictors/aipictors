import { describe, expect, test } from "bun:test"
import {
  classifyPath,
  classifyReferrer,
  PAGE_VIEW_INLINE_SCRIPT,
  visitFlags,
} from "~/utils/page-view"

/** 埋め込みスクリプトの判定関数を取り出す（送信はしない） */
const loadInline = () => {
  const win: Record<string, unknown> = {}
  const run = new Function(
    "window",
    "navigator",
    "fetch",
    "document",
    "location",
    PAGE_VIEW_INLINE_SCRIPT,
  )
  run(
    win,
    { webdriver: true },
    () => Promise.resolve(),
    { referrer: "" },
    { pathname: "/" },
  )
  return win.__aipPv as {
    cr: (r: string) => string
    cp: (p: string) => string
    vf: (last: string | null, today: string) => string
  }
}

const referrers = [
  "",
  "https://www.aipictors.com/posts/1",
  "https://beta.aipictors.com/",
  "https://www.google.com/",
  "https://www.google.co.jp/search?q=a",
  "https://search.yahoo.co.jp/search",
  "https://www.bing.com/",
  "https://t.co/abc",
  "https://x.com/aipictors",
  "https://discord.com/channels/1",
  "https://www.pixiv.net/",
  "https://chatgpt.com/",
  "https://example.com/",
  "not a url",
]

const paths = [
  "/",
  "/en",
  "/en/posts/123",
  "/posts/123",
  "/posts/2d",
  "/r/posts/5",
  "/r",
  "/r/tags/a",
  "/generation",
  "/tags/x",
  "/rankings/2026/11",
  "/plus",
  "/events/abc",
  "/models/u/1",
  "/settings/profile",
  "/users/foo",
]

describe("page-view", () => {
  test("流入元の分類", () => {
    expect(classifyReferrer("")).toBe("direct")
    expect(classifyReferrer("https://www.aipictors.com/r")).toBe("internal")
    expect(classifyReferrer("https://www.google.co.jp/")).toBe("google")
    expect(classifyReferrer("https://t.co/x")).toBe("x")
    expect(classifyReferrer("https://example.com/")).toBe("other")
  })

  test("ページの種類", () => {
    expect(classifyPath("/")).toBe("top")
    expect(classifyPath("/en/posts/1")).toBe("post")
    expect(classifyPath("/r/posts/1")).toBe("r_post")
    expect(classifyPath("/posts/2d")).toBe("other")
    expect(classifyPath("/generation")).toBe("generation")
  })

  test("訪問の印", () => {
    // 2026-11-09 は月曜
    expect(visitFlags("2026-11-10", "2026-11-10")).toBe("")
    expect(visitFlags("2026-11-09", "2026-11-10")).toBe("&d=1")
    expect(visitFlags("2026-11-08", "2026-11-09")).toBe("&d=1&w=1")
    expect(visitFlags("2026-10-31", "2026-11-01")).toBe("&d=1&m=1")
    expect(visitFlags("2026-10-25", "2026-11-02")).toBe("&d=1&w=1&m=1")
    expect(visitFlags(null, "2026-11-10")).toBe("&d=1&w=1&m=1&n=1")
    expect(visitFlags("x", "2026-11-10")).toBe("&d=1&w=1&m=1&n=1")
  })

  test("埋め込みスクリプトの判定が同じ", () => {
    const inline = loadInline()
    for (const [last, today] of [
      ["2026-11-10", "2026-11-10"],
      ["2026-11-09", "2026-11-10"],
      ["2026-11-08", "2026-11-09"],
      ["2026-10-31", "2026-11-01"],
      ["2026-10-25", "2026-11-02"],
      [null, "2026-11-10"],
      ["x", "2026-11-10"],
    ] as const) {
      expect(inline.vf(last, today)).toBe(visitFlags(last, today))
    }
    for (const referrer of referrers) {
      expect(inline.cr(referrer)).toBe(classifyReferrer(referrer))
    }
    for (const path of paths) {
      expect(inline.cp(path)).toBe(classifyPath(path))
    }
  })
})

describe("page-view の埋め込みスクリプトと操作の記録", () => {
  test("最初の page_view を積み、hydration の前に隠れた・離れたら送る", () => {
    const win: Record<string, unknown> = {}
    const store = new Map<string, string>()
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    }
    const sent: { url: string; body: string }[] = []
    let onHide: (() => void) | null = null
    let onHidden: (() => void) | null = null
    const run = new Function(
      "window",
      "navigator",
      "fetch",
      "document",
      "location",
      "sessionStorage",
      "localStorage",
      "addEventListener",
      PAGE_VIEW_INLINE_SCRIPT,
    )
    run(
      win,
      {
        webdriver: false,
        language: "ja-JP",
        sendBeacon: (url: string, body: string) => sent.push({ url, body }),
      },
      () => Promise.resolve(),
      {
        referrer: "https://www.google.com/",
        documentElement: { dataset: { aipAuth: "in" } },
        visibilityState: "hidden",
        addEventListener: (name: string, listener: () => void) => {
          if (name === "visibilitychange") onHidden = listener
        },
      },
      { pathname: "/posts/1" },
      storage,
      storage,
      (name: string, listener: () => void) => {
        if (name === "pagehide") onHide = listener
      },
    )
    const queue = win.__aipEv as {
      sid: string
      q: { e: string; p: string; r: string; v: string }[]
    }
    expect(queue.sid).toMatch(/^[a-z0-9]{6,16}$/)
    expect(store.get("aip.sid")?.startsWith(`${queue.sid}.`)).toBe(true)
    expect(queue.q[0]).toMatchObject({
      e: "page_view",
      p: "/posts/1",
      r: "google",
      v: "dn",
    })
    ;(onHidden as unknown as () => void)()
    expect(sent.length).toBe(1)
    expect(sent[0]?.url).toBe("/api/ev")
    const body = JSON.parse(sent[0]?.body ?? "{}")
    expect(body).toMatchObject({ v: 1, sid: queue.sid, a: 1, l: "ja-JP" })
    expect(body.ev[0].e).toBe("page_view")
    // 送ったあとは二重に送らない（隠れたときも同じ送信）
    ;(onHide as unknown as () => void)()
    ;(onHidden as unknown as () => void)()
    expect(sent.length).toBe(1)
  })
})
