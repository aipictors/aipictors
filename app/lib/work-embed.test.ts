import { describe, expect, test } from "bun:test"
import {
  buildOembed,
  createEmbedCode,
  type EmbedWork,
  handleEmbedRequest,
  renderWorkEmbedHtml,
} from "~/lib/work-embed"

const work = (overrides: Partial<EmbedWork> = {}): EmbedWork => ({
  id: "123",
  title: "秋の<空>",
  accessType: "PUBLIC",
  rating: "G",
  isDeleted: false,
  largeThumbnailImageURL: "https://files.aipictors.com/thumb",
  user: {
    name: "作者",
    login: "author",
    iconUrl: "https://files.aipictors.com/icon",
  },
  ...overrides,
})

const env = { VITE_GRAPHQL_ENDPOINT_REMIX: "https://api.example/" }

describe("renderWorkEmbedHtml", () => {
  test("全年齢は画像とタイトルを出し、作品ページへリンクする", () => {
    const html = renderWorkEmbedHtml(work(), { ageConfirmed: false })
    expect(html).toContain("https://files.aipictors.com/thumb")
    expect(html).toContain("秋の&lt;空&gt;")
    expect(html).not.toContain("秋の<空>")
    expect(html).toContain('href="https://www.aipictors.com/posts/123"')
  })

  test("R18 は確認するまで画像とタイトルを含めない", () => {
    const html = renderWorkEmbedHtml(work({ rating: "R18" }), {
      ageConfirmed: false,
    })
    expect(html).not.toContain("files.aipictors.com/thumb")
    expect(html).not.toContain("秋の")
    expect(html).toContain("/embed/posts/123?age=18")
  })

  test("R18 は確認後に画像を出し、R18 の作品ページへリンクする", () => {
    const html = renderWorkEmbedHtml(work({ rating: "R18G" }), {
      ageConfirmed: true,
    })
    expect(html).toContain("files.aipictors.com/thumb")
    expect(html).toContain('href="https://www.aipictors.com/r/posts/123"')
  })

  test("限定公開・削除済み・見つからない作品は表示しない", () => {
    for (const target of [
      work({ accessType: "LIMITED" }),
      work({ isDeleted: true }),
      null,
    ]) {
      const html = renderWorkEmbedHtml(target, { ageConfirmed: true })
      expect(html).toContain("この作品は表示できません")
      expect(html).not.toContain("files.aipictors.com/thumb")
    }
  })

  test("自サイト以外の画像の URL は使わない", () => {
    const html = renderWorkEmbedHtml(
      work({ largeThumbnailImageURL: "https://evil.example/x" }),
      { ageConfirmed: false },
    )
    expect(html).not.toContain("evil.example")
  })
})

describe("buildOembed", () => {
  test("R18 はタイトルとサムネイルを返さない", () => {
    const body = buildOembed(work({ rating: "R18" }), {
      maxWidth: 300,
      maxHeight: null,
    })
    expect(body.title).toBe("Aipictorsの作品")
    expect("thumbnail_url" in body).toBe(false)
    expect(body.width).toBe(300)
    expect(body.html).toContain('width="300"')
  })
})

describe("createEmbedCode", () => {
  test("R18 はタイトルを属性に入れない", () => {
    expect(
      createEmbedCode({ id: "1", title: "秘密", isAdult: true }),
    ).not.toContain("秘密")
  })
})

describe("handleEmbedRequest", () => {
  test("埋め込みとoEmbed以外は扱わない", async () => {
    const response = await handleEmbedRequest(
      new Request("https://www.aipictors.com/posts/1"),
      env,
    )
    expect(response).toBeNull()
  })

  test("余計なクエリは正しい URL へ移す", async () => {
    const response = await handleEmbedRequest(
      new Request("https://www.aipictors.com/embed/posts/123?x=1"),
      env,
      async () => work(),
    )
    expect(response?.status).toBe(301)
    expect(response?.headers.get("Location")).toBe("/embed/posts/123")
  })

  test("配信のキャッシュに置き、作品の Cache-Tag を付ける", async () => {
    const response = await handleEmbedRequest(
      new Request("https://www.aipictors.com/embed/posts/123"),
      env,
      async () => work(),
    )
    expect(response?.status).toBe(200)
    expect(response?.headers.get("CDN-Cache-Control")).toContain(
      "max-age=86400",
    )
    expect(response?.headers.get("Cache-Tag")).toBe("work-123")
    expect(response?.headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors *",
    )
  })

  test("API の不調はキャッシュしない", async () => {
    const response = await handleEmbedRequest(
      new Request("https://www.aipictors.com/embed/posts/123"),
      env,
      async () => {
        throw new Error("down")
      },
    )
    expect(response?.status).toBe(503)
    expect(response?.headers.get("Cache-Control")).toBe("no-store")
  })

  test("oEmbed は作品ページの URL から返す", async () => {
    const response = await handleEmbedRequest(
      new Request(
        `https://www.aipictors.com/api/oembed?url=${encodeURIComponent("https://www.aipictors.com/posts/123")}`,
      ),
      env,
      async () => work(),
    )
    const body = (await response?.json()) as { type: string; html: string }
    expect(body.type).toBe("rich")
    expect(body.html).toContain("https://www.aipictors.com/embed/posts/123")
  })
})
