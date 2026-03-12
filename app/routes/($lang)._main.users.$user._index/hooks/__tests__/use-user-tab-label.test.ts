import { describe, test, expect } from "bun:test"
import { useUserTabLabels } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-tab-label"

describe("useUserTabLabels", () => {
  test("日本語のラベルを正しく返す", () => {
    const props = {
      hasImageWorks: true,
      hasNovelWorks: true,
      hasColumnWorks: false,
      hasVideoWorks: true,
      hasAlbums: false,
      hasUserEvents: true,
      hasFolders: true,
      hasPublicStickers: true,
      hasBadges: false,
      lang: "ja",
    }

    const labels = useUserTabLabels(props)

    expect(labels).toEqual([
      "ポートフォリオ",
      "画像",
      "小説",
      "動画",
      "イベント",
      "コレクション",
      "スタンプ",
    ])
  })

  test("英語のラベルを正しく返す", () => {
    const props = {
      hasImageWorks: true,
      hasNovelWorks: false,
      hasColumnWorks: true,
      hasVideoWorks: true,
      hasAlbums: true,
      hasUserEvents: true,
      hasFolders: false,
      hasPublicStickers: false,
      hasBadges: false,
      lang: "en",
    }

    const labels = useUserTabLabels(props)

    expect(labels).toEqual([
      "portfolio",
      "Images",
      "Columns",
      "Videos",
      "Series",
      "Events",
    ])
  })

  test("全てのプロパティがfalseの場合はポートフォリオのみを返す", () => {
    const props = {
      hasImageWorks: false,
      hasNovelWorks: false,
      hasColumnWorks: false,
      hasVideoWorks: false,
      hasAlbums: false,
      hasUserEvents: false,
      hasFolders: false,
      hasPublicStickers: false,
      hasBadges: false,
      lang: "ja",
    }

    const labels = useUserTabLabels(props)

    expect(labels).toEqual(["ポートフォリオ"])
  })

  test("全てのプロパティがtrueの場合はすべてのラベルを返す", () => {
    const props = {
      hasImageWorks: true,
      hasNovelWorks: true,
      hasColumnWorks: true,
      hasVideoWorks: true,
      hasAlbums: true,
      hasUserEvents: true,
      hasFolders: true,
      hasPublicStickers: true,
      hasBadges: true,
      lang: "en",
    }

    const labels = useUserTabLabels(props)

    expect(labels).toEqual([
      "portfolio",
      "Images",
      "Novels",
      "Columns",
      "Videos",
      "Series",
      "Events",
      "Collections",
      "Stickers",
      "Badges",
    ])
  })
})
