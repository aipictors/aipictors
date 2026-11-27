import { describe, expect, test } from "bun:test"
import { deviceOf, handleEventLog, osOf } from "~/lib/event-log-server"

const CHROME_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"

const makeEnv = () => {
  const points: { indexes?: string[]; blobs?: string[]; doubles?: number[] }[] =
    []
  return {
    points,
    env: {
      EVENTS: {
        writeDataPoint: (point: (typeof points)[number]) => points.push(point),
      },
      EVENT_UID_SALT: "salt",
    },
  }
}

/** happy-dom の Request は Origin を落とすので、使うところだけの形で作る */
const post = (body: unknown, headers: Record<string, string> = {}) => {
  const all: Record<string, string> = {
    "user-agent": CHROME_IPHONE,
    origin: "https://www.aipictors.com",
    ...headers,
  }
  return {
    method: "POST",
    url: "https://www.aipictors.com/api/ev",
    headers: { get: (name: string) => all[name.toLowerCase()] ?? null },
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    cf: { country: "JP", asn: 2516 },
  } as unknown as Request
}

describe("event-log-server", () => {
  test("1 イベント 1 行で書く（パスのクエリは捨て、ユーザーはハッシュ）", async () => {
    const { env, points } = makeEnv()
    const res = await handleEventLog(
      post({
        sid: "abc123xyz",
        u: "12345",
        l: "ja-JP",
        ev: [
          { e: "page_view", p: "/posts/1?x=1", r: "google", t: 1700, v: "dn" },
          {
            e: "shortage_view",
            s: "free",
            p: "/generation",
            x: '{"a":1}',
            n: 3,
          },
          { e: "bad name!", p: "/" },
        ],
      }),
      env,
    )
    expect(res.status).toBe(204)
    expect(points.length).toBe(2)
    const [view, shortage] = points
    expect(view?.indexes).toEqual(["abc123xyz"])
    expect(view?.blobs?.slice(0, 6)).toEqual([
      "page_view",
      "",
      "post",
      "/posts/1",
      "google",
      "abc123xyz",
    ])
    expect(view?.blobs?.[6]).toMatch(/^[0-9a-f]{16}$/)
    expect(view?.blobs?.[6]).not.toContain("12345")
    expect(view?.blobs?.slice(7, 13)).toEqual([
      "in",
      "mobile",
      "ios",
      "ja-jp",
      "JP",
      "ok",
    ])
    expect(view?.blobs?.[14]).toBe("dn")
    expect(view?.doubles).toEqual([0, 1700])
    expect(shortage?.blobs?.[1]).toBe("free")
    expect(shortage?.blobs?.[2]).toBe("generation")
    expect(shortage?.blobs?.[13]).toBe('{"a":1}')
    expect(shortage?.doubles?.[0]).toBe(3)
  })

  test("クローラー・よそのサイト・GET は書かない", async () => {
    const { env, points } = makeEnv()
    const ev = { sid: "abc123xyz", ev: [{ e: "page_view", p: "/" }] }
    await handleEventLog(
      post(ev, { "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" }),
      env,
    )
    await handleEventLog(
      post(ev, {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0 Safari/537.36",
      }),
      env,
    )
    const foreign = await handleEventLog(
      post(ev, { origin: "https://evil.example" }),
      env,
    )
    expect(foreign.status).toBe(403)
    const get = await handleEventLog(
      new Request("https://www.aipictors.com/api/ev"),
      env,
    )
    expect(get.status).toBe(405)
    expect(points.length).toBe(0)
  })

  test("ログインしていない・壊れた形", async () => {
    const { env, points } = makeEnv()
    expect((await handleEventLog(post("{"), env)).status).toBe(400)
    expect((await handleEventLog(post({ ev: 1 }), env)).status).toBe(400)
    await handleEventLog(
      post({ sid: "NOT VALID", u: "a@b.c", ev: [{ e: "x", p: "" }] }),
      env,
    )
    expect(points[0]?.blobs?.[5]).toBe("")
    expect(points[0]?.blobs?.[6]).toBe("")
    expect(points[0]?.blobs?.[7]).toBe("out")
    expect(points[0]?.blobs?.[3]).toBe("/")
  })

  test("端末と OS", () => {
    expect(deviceOf(CHROME_IPHONE)).toBe("mobile")
    expect(
      deviceOf("Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36"),
    ).toBe("tablet")
    expect(
      deviceOf("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36"),
    ).toBe("mobile")
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
      "desktop",
    )
    expect(osOf("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("mac")
  })
})
