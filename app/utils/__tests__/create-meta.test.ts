import { describe, expect, test } from "bun:test"
import { createMeta, metadata } from "~/utils/create-meta"
import { config } from "~/config"

describe("createMeta", () => {
  test("日本語のメタデータが正しく生成される", () => {
    const data = {
      title: "テストタイトル",
      description: "テストの説明",
      image: "https://example.com/test-image.jpg",
      isIndex: true,
      isTop: false,
    }

    const metaTags = createMeta(data)

    expect(metaTags).toContainEqual({
      title: "テストタイトル - Aipictors - AI画像投稿サイト・生成サイト",
    })
    expect(metaTags).toContainEqual({
      name: "description",
      content: "テストの説明",
    })
    expect(metaTags).toContainEqual({
      name: "twitter:image",
      content: "https://example.com/test-image.jpg",
    })
    expect(metaTags).toContainEqual({
      name: "robots",
      content: "index, follow",
    })
  })

  test("英語のメタデータが正しく生成される", () => {
    const data = {
      enTitle: "Test Title",
      enDescription: "Test Description",
      image: "https://example.com/test-image.jpg",
      isIndex: true,
      isTop: true,
    }

    const metaTags = createMeta(data, {}, "en")

    expect(metaTags).toContainEqual({
      title: "Test Title - Aipictors - AI Illustration & Generation",
    })
    expect(metaTags).toContainEqual({
      name: "description",
      content: "Test Description",
    })
    expect(metaTags).toContainEqual({
      name: "twitter:image",
      content: "https://example.com/test-image.jpg",
    })
    expect(metaTags).toContainEqual({ property: "og:type", content: "website" })
  })

  test("動的データが正しく置換される", () => {
    const data = {
      title: "テスト{{name}}",
      description: "説明{{value}}",
      image: "https://example.com/{{imagePath}}",
      isIndex: false,
    }

    const dynamicData = {
      name: "タイトル",
      value: "100",
      imagePath: "dynamic-image.jpg",
    }

    const metaTags = createMeta(data, dynamicData)

    expect(metaTags).toContainEqual({
      title: "テストタイトル - Aipictors - AI画像投稿サイト・生成サイト",
    })
    expect(metaTags).toContainEqual({ name: "description", content: "説明100" })
    expect(metaTags).toContainEqual({
      name: "twitter:image",
      content: "https://example.com/dynamic-image.jpg",
    })
    expect(metaTags).toContainEqual({
      name: "robots",
      content: "noindex, nofollow",
    })
  })

  test("デフォルトのメタデータが使用される", () => {
    const data = {}

    const metaTags = createMeta(data)

    expect(metaTags).toContainEqual({ title: metadata.titleJA })
    expect(metaTags).toContainEqual({
      name: "description",
      content: metadata.descriptionJA,
    })
    expect(metaTags).toContainEqual({
      name: "twitter:image",
      content: config.defaultOgpImageUrl,
    })
  })
})
