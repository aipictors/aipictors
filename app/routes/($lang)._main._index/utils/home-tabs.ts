/** ホームのタブ */
export type HomeTab = "home" | "new" | "follow-user" | "follow-tag"

export const HOME_TAB_PATHS: Record<HomeTab, string> = {
  home: "/home",
  new: "/",
  "follow-user": "/follow-user-works",
  "follow-tag": "/follow-tag-works",
}
