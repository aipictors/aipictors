/**
 * 下のタブを出さないページ（自分の送信ボタンが画面下にあるページ・手続き中のページ）。
 * 作品の編集は /posts/:id/image/edit のように種類と edit の間が「/」
 */
const HIDDEN_PATH_PATTERN =
  /^\/(?:new|plus|settings|support|contact|admin|app|flutter|generation\/demonstration)(?:\/|$)|^\/posts\/[^/]+\/(?:(?:image|animation|text|video)\/)?edit(?:\/|$)/

/** 言語の接頭辞を外したパスで判定する */
export const isMobileTabBarHiddenPath = (remainder: string) =>
  HIDDEN_PATH_PATTERN.test(remainder)
