/** ホームのタブ */
export type HomeTab =
  | "recommended"
  | "home"
  | "new"
  | "follow-user"
  | "follow-tag"

export const HOME_TAB_PATHS: Record<HomeTab, string> = {
  // トップ（/）はホーム（ユーザの推薦・前日ランキングなどの欄）。以前の /home は / へ転送する
  home: "/",
  recommended: "/recommended",
  new: "/new-works",
  "follow-user": "/follow-user-works",
  "follow-tag": "/follow-tag-works",
}
