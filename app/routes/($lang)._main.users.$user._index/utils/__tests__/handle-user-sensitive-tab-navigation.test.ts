import { handleUserSensitiveTabNavigation } from "~/routes/($lang)._main.users.$user._index/utils/handle-user-sensitive-tab-navigation"

describe("handleUserSensitiveTabNavigation", () => {

  test("日本語のポートフォリオにナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "ポートフォリオ",
      lang: "ja",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123")
  })

  test("英語のPortfolioにナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "Portfolio",
      lang: "en",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123")
  })

  test("日本語の画像にナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "画像",
      lang: "ja",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123/posts")
  })

  test("英語のImagesにナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "Images",
      lang: "en",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123/posts")
  })

  test("日本語のスタンプにナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "スタンプ",
      lang: "ja",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123/stickers")
  })

  test("英語のStickersにナビゲートする", () => {
    const onNavigateCallback = jest.fn()
    const props = {
      userId: "123",
      type: "Stickers",
      lang: "en",
      onNavigateCallback
    }

    handleUserSensitiveTabNavigation(props)

    expect(onNavigateCallback).toHaveBeenCalledWith("/r/users/123/stickers")
  })
})
