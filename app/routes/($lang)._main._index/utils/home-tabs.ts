/** ホームのタブ */
export type HomeTab =
  | "recommended"
  | "home"
  | "new"
  | "follow-user"
  | "follow-tag"

export const HOME_TAB_PATHS: Record<HomeTab, string> = {
  recommended: "/",
  home: "/home",
  new: "/new-works",
  "follow-user": "/follow-user-works",
  "follow-tag": "/follow-tag-works",
}
