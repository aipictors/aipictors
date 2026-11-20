import { describe, expect, test } from "bun:test"
import type { MicroCmsApiRelease } from "~/types/micro-cms-release-response"
import {
  findFirstReleaseImage,
  toReleaseCard,
  toReleaseExcerpt,
} from "~/utils/release-card"

const release = (props: Partial<MicroCmsApiRelease>): MicroCmsApiRelease =>
  ({
    id: "a",
    title: "題",
    description: "",
    platform: [],
    createdAt: "2026-11-20T15:30:00.000Z",
    publishedAt: "2026-11-20T15:30:00.000Z",
    ...props,
  }) as unknown as MicroCmsApiRelease

describe("お知らせのカード", () => {
  test("表紙はサムネイル、なければ本文の最初の画像（Markdown・HTML のどちらでも）", () => {
    expect(
      findFirstReleaseImage(
        "文\n\n![4コマ](https://assets.aipictors.com/a.webp)",
      ),
    ).toBe("https://assets.aipictors.com/a.webp")
    expect(
      findFirstReleaseImage(
        '<img src="https://www.aipictors.com/b.jpg" alt=""> ![x](https://c.png)',
      ),
    ).toBe("https://www.aipictors.com/b.jpg")
    expect(findFirstReleaseImage('<video src="https://v.mp4"></video>文')).toBe(
      null,
    )
    expect(
      toReleaseCard(
        release({
          thumbnail_url: { url: "https://thumb.png" },
          description: "![x](https://body.png)",
        }),
      ).coverUrl,
    ).toBe("https://thumb.png")
  })

  test("冒頭の文は画像・HTML・Markdown の印・決まり文句のあいさつを除く", () => {
    expect(
      toReleaseExcerpt(
        "![図](https://a.png)\n\nいつもAipictorsをご利用いただき、ありがとうございます。\n\n## 新機能\n\n- **埋め込み**が[できます](https://x)\n<p>以上です&nbsp;</p>",
      ),
    ).toBe("新機能 埋め込みができます 以上です")
    expect(toReleaseExcerpt("あ".repeat(200))).toHaveLength(91)
  })

  test("日付は日本時間、NEW は投稿から 7 日以内", () => {
    const now = Date.parse("2026-11-21T03:00:00.000Z")
    const card = toReleaseCard(release({}), now)
    // UTC では 11/20 だが日本時間では 11/21
    expect(card.dateText).toBe("2026.11.21")
    expect(card.isNew).toBe(true)
    expect(
      toReleaseCard(release({ publishedAt: "2026-11-10T00:00:00.000Z" }), now)
        .isNew,
    ).toBe(false)
  })
})
