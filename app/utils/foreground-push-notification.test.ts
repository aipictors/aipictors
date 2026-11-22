import { describe, expect, test } from "bun:test"
import { toForegroundNotification } from "~/utils/foreground-push-notification"

describe("画面を開いている間に届いたプッシュ", () => {
  test("notification で送られた文面でもタイトルと本文が出る", () => {
    const result = toForegroundNotification({
      notification: { title: "リクエスト", body: "あいさんからメッセージ" },
      data: { type: "request", url: "/requests/12" },
    })
    expect(result?.title).toBe("リクエスト")
    expect(result?.options.body).toBe("あいさんからメッセージ")
  })

  test("押したときに開く URL を data.link にそろえる", () => {
    const result = toForegroundNotification({
      notification: { title: "リクエスト" },
      data: { type: "request", url: "/requests/12" },
    })
    expect(result?.options.data.link).toBe("/requests/12")
  })

  test("data だけで送られた古い形もそのまま出せる", () => {
    const result = toForegroundNotification({
      data: {
        title: "お知らせ",
        body: "本文",
        icon: "https://example.com/i.png",
        imageUrl: "https://example.com/w.png",
        tag: "notification",
        link: "/notifications",
      },
    })
    expect(result?.title).toBe("お知らせ")
    expect(result?.options.image).toBe("https://example.com/w.png")
    expect(result?.options.tag).toBe("notification")
    expect(result?.options.data.link).toBe("/notifications")
  })

  test("タイトルがないものは出さない", () => {
    expect(toForegroundNotification({ data: { type: "request" } })).toBeNull()
    expect(toForegroundNotification({ notification: { title: " " } })).toBeNull()
    expect(toForegroundNotification(undefined)).toBeNull()
  })
})
