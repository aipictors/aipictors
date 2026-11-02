/**
 * 設定のページの一覧（今いる項目の判定と、PC の見出しに使う）
 */
const SETTINGS_PAGES: { href: string; ja: string; en: string }[] = [
  { href: "/settings/profile", ja: "プロフィール", en: "Profile" },
  { href: "/settings/account", ja: "アカウント設定", en: "Account Settings" },
  { href: "/settings/discord", ja: "Discord 連携", en: "Discord" },
  { href: "/settings/points", ja: "コイン", en: "Coins" },
  {
    href: "/settings/request",
    ja: "サポートを受け取る",
    en: "Receive Support",
  },
  {
    href: "/settings/support-received",
    ja: "応援コイン受け取り",
    en: "Received Support Coins",
  },
  {
    href: "/settings/advertisements",
    ja: "広告設定",
    en: "Advertisement Settings",
  },
  {
    href: "/settings/notification",
    ja: "通知・いいね",
    en: "Notifications & Likes",
  },
  {
    href: "/settings/push-notification",
    ja: "Push通知",
    en: "Push Notifications",
  },
  {
    href: "/settings/restriction",
    ja: "表示コンテンツ",
    en: "Display Content",
  },
  { href: "/settings/color", ja: "カラーテーマ", en: "Color Theme" },
  { href: "/settings/followed/tags", ja: "お気に入りタグ", en: "Followed Tags" },
  { href: "/settings/muted/users", ja: "ユーザミュート", en: "Muted Users" },
  {
    href: "/settings/blocked/users",
    ja: "ユーザブロック",
    en: "Blocked Users",
  },
  { href: "/settings/muted/tags", ja: "タグミュート", en: "Muted Tags" },
  { href: "/settings/sticker", ja: "スタンプ", en: "Stickers" },
]

const toSettingsPath = (pathname: string) => {
  const index = pathname.indexOf("/settings")
  return index < 0 ? pathname : pathname.slice(index).replace(/\/+$/, "")
}

/** 今のページの項目を探す。/settings（PC では通知を出す）は通知、/settings/account/login はアカウント設定 */
export const findSettingsPage = (pathname: string) => {
  const path = toSettingsPath(pathname)
  if (path === "/settings") {
    return SETTINGS_PAGES.find((page) => page.href === "/settings/notification")
  }
  return SETTINGS_PAGES.find(
    (page) => path === page.href || path.startsWith(`${page.href}/`),
  )
}

export const findSettingsPageHref = (pathname: string) => {
  const page = findSettingsPage(pathname)
  // Push 通知は通知の中の項目
  return page?.href === "/settings/push-notification"
    ? "/settings/notification"
    : (page?.href ?? null)
}
