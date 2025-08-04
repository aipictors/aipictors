/**
 * ユーザーナビゲーションメニューの共通スタイル定数
 * スケルトンと実際の表示で同じサイズを保証するため
 */

export const userNavigationStyles = {
  // コンテナの幅（スマホ対応を最優先に調整）
  container: "w-[200px] sm:w-[240px] md:w-[280px]", // スマホでは200px、タブレットでは240px、PCでは280px

  // ユーザー情報セクション
  userName: "h-7 font-bold text-lg truncate", // ユーザー名（省略表示対応）
  userLogin: "h-5 text-muted-foreground text-sm truncate", // @ログイン名（省略表示対応）

  // フォロー・フォロワー情報
  followCount: "h-7 font-bold text-lg", // フォロー数
  followLabel: "text-muted-foreground text-sm", // フォローラベル

  // メニュー項目の共通スタイル（コンパクト化）
  menuItem:
    "flex items-center rounded-sm px-1.5 py-1 hover:bg-accent min-h-[28px]", // パディングと高さを削減
  menuIcon: "mr-1.5 h-4 w-4 shrink-0", // マージンを削減
  menuText: "h-4 text-sm", // テキストの高さとサイズを統一
  menuItemText: "flex-1 truncate", // テキスト部分は省略表示

  // メニューテキストの幅（さらにコンパクト化）
  menuTextWidths: {
    myPage: "w-10 sm:w-12 md:w-16", // マイページ
    dashboard: "w-14 sm:w-18 md:w-24", // ダッシュボード
    myPosts: "w-12 sm:w-16 md:w-20", // 自分の作品
    support: "w-10 sm:w-12 md:w-16", // 支援管理
    account: "w-10 sm:w-12 md:w-16", // アカウント
    contact: "w-14 sm:w-18 md:w-24", // お問い合わせ
    plus: "w-14 sm:w-18 md:w-24", // Aipictors+
    settings: "w-6 sm:w-8 md:w-12", // 設定
    theme: "w-6 sm:w-8 md:w-12", // テーマ
    language: "w-16 sm:w-20 md:w-28", // 言語/Language
    logout: "w-10 sm:w-12 md:w-16", // ログアウト
  },

  // スケルトン用スタイル
  skeleton: {
    base: "animate-pulse rounded bg-gray-200 dark:bg-gray-700",
    userName: "h-7 w-24 sm:w-28 md:w-36", // ユーザー名スケルトン（レスポンシブ）
    userLogin: "h-5 w-16 sm:w-20 md:w-28", // ログイン名スケルトン（レスポンシブ）
    followCount: "h-7 w-6 sm:w-8 md:w-12", // フォロー数スケルトン（レスポンシブ）
    menuIcon: "h-4 w-4", // メニューアイコンスケルトン
  },
} as const

/**
 * スケルトン用のクラス名を生成するヘルパー関数
 */
export const getSkeletonClass = (baseSize: string) => {
  return `${baseSize} ${userNavigationStyles.skeleton.base}`
}

/**
 * メニュー項目のスケルトン用のクラス名を生成するヘルパー関数
 */
export const getMenuSkeletonClass = (
  menuType: keyof typeof userNavigationStyles.menuTextWidths,
) => {
  const width = userNavigationStyles.menuTextWidths[menuType]
  return `${userNavigationStyles.menuText} ${width} ${userNavigationStyles.skeleton.base}`
}
