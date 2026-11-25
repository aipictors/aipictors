/**
 * 設定のページの一覧（今いる項目の判定と、PC の見出しに使う）
 */
const SETTINGS_PAGES: {
  href: string
  ja: string
  en: string
  /** 見出しの下に出す一言 */
  descriptionJa: string
  descriptionEn: string
}[] = [
  {
    href: "/settings/profile",
    ja: "プロフィール",
    en: "Profile",
    descriptionJa:
      "アイコン・ヘッダー・枠と、ユーザーページに出す紹介を編集します",
    descriptionEn:
      "Edit your icon, header, frames and what appears on your page",
  },
  {
    href: "/settings/account",
    ja: "アカウント設定",
    en: "Account Settings",
    descriptionJa: "ユーザー ID・パスワード・SNS の紐付け・退会",
    descriptionEn: "User ID, password, linked accounts and account removal",
  },
  {
    href: "/settings/discord",
    ja: "Discord 連携",
    en: "Discord",
    descriptionJa: "Discord の名前の横に、レベルやバッジを出します",
    descriptionEn: "Show your level and badges next to your Discord name",
  },
  {
    href: "/settings/points",
    ja: "コイン",
    en: "Coins",
    descriptionJa: "コインの残高・履歴・有効期限と使い方",
    descriptionEn: "Coin balance, history, expiry and how coins are used",
  },
  {
    href: "/settings/support-received",
    ja: "応援コイン受け取り",
    en: "Received Support Coins",
    descriptionJa:
      "推してもらったコインと応援してくれた人・推しの受け取りと表示",
    descriptionEn:
      "Coins you received, the people who supported you, and support settings",
  },
  {
    href: "/settings/creator-rewards",
    ja: "収益の受け取り（クリエイター報酬）",
    en: "Rewards payout (Creator Rewards)",
    descriptionJa: "報酬の残高と振込先の登録・振込の申請",
    descriptionEn: "Reward balance, payout account and payout requests",
  },
  {
    href: "/settings/advertisements",
    ja: "広告設定",
    en: "Advertisement Settings",
    descriptionJa: "出している広告の内容と表示の状況",
    descriptionEn: "Your ads and how they are performing",
  },
  {
    href: "/settings/notification",
    ja: "通知・いいね",
    en: "Notifications & Likes",
    descriptionJa: "受け取る通知と、いいねしたときの名前の出し方",
    descriptionEn: "Which notifications you get and how your likes appear",
  },
  {
    href: "/settings/push-notification",
    ja: "Push通知",
    en: "Push Notifications",
    descriptionJa: "このブラウザ・端末に届く通知",
    descriptionEn: "Notifications delivered to this browser or device",
  },
  {
    href: "/settings/restriction",
    ja: "表示コンテンツ",
    en: "Display Content",
    descriptionJa: "見る作品の年齢制限と表示のしかた",
    descriptionEn: "Age ratings and how works are shown to you",
  },
  {
    href: "/settings/color",
    ja: "カラーテーマ",
    en: "Color Theme",
    descriptionJa: "ライト・ダークとテーマの色",
    descriptionEn: "Light or dark mode and accent color",
  },
  {
    href: "/settings/followed/tags",
    ja: "お気に入りタグ",
    en: "Followed Tags",
    descriptionJa: "フォローしたタグの作品をホームに出します",
    descriptionEn: "Works with tags you follow appear on your home",
  },
  {
    href: "/settings/muted/users",
    ja: "ユーザミュート",
    en: "Muted Users",
    descriptionJa: "作品やコメントを見えなくしたユーザー",
    descriptionEn: "Users whose works and comments you've hidden",
  },
  {
    href: "/settings/blocked/users",
    ja: "ユーザブロック",
    en: "Blocked Users",
    descriptionJa: "あなたに関われないようにしたユーザー",
    descriptionEn: "Users who can't interact with you",
  },
  {
    href: "/settings/muted/tags",
    ja: "タグミュート",
    en: "Muted Tags",
    descriptionJa: "このタグが付いた作品を見えなくします",
    descriptionEn: "Hide works that have these tags",
  },
  {
    href: "/settings/sticker",
    ja: "スタンプ",
    en: "Stickers",
    descriptionJa: "コメントで使うスタンプと、自分で作ったスタンプ",
    descriptionEn: "Stickers you use in comments and the ones you made",
  },
]

const toSettingsPath = (pathname: string) => {
  const index = pathname.indexOf("/settings")
  return index < 0 ? pathname : pathname.slice(index).replace(/\/+$/, "")
}

/** 設定のトップ（/settings。スマホではメニューを出す） */
export const isSettingsIndexPath = (pathname: string) =>
  toSettingsPath(pathname) === "/settings"

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
