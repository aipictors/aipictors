import { describe, test, expect } from "bun:test"
import { useUserActiveTab } from "~/routes/($lang)._main.users.$user._index/hooks/use-user-active-tab"

describe("useUserActiveTab", () => {

  test("日本語のポートフォリオをデフォルトで返す", () => {
    const props = {
      url: "/users/123",
      lang: "ja",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("ポートフォリオ")
  })

  test("英語のPortfolioをデフォルトで返す", () => {
    const props = {
      url: "/users/123",
      lang: "en",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("Portfolio")
  })

  test("日本語の画像を返す", () => {
    const props = {
      url: "/users/123/posts",
      lang: "ja",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("画像")
  })

  test("英語のImagesを返す", () => {
    const props = {
      url: "/users/123/posts",
      lang: "en",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("Images")
  })

  test("日本語の小説を返す", () => {
    const props = {
      url: "/users/123/novels",
      lang: "ja",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("小説")
  })

  test("英語のNovelsを返す", () => {
    const props = {
      url: "/users/123/novels",
      lang: "en",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("Novels")
  })

  test("日本語のスタンプを返す", () => {
    const props = {
      url: "/users/123/stickers",
      lang: "ja",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("スタンプ")
  })

  test("英語のStickersを返す", () => {
    const props = {
      url: "/users/123/stickers",
      lang: "en",
    }

    const getActiveTab = useUserActiveTab(props)

    expect(getActiveTab()).toBe("Stickers")
  })
})
