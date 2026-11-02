import { BellIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * プロフィールのアイコンの読み込み前の表示（前回のアイコンを CSS 変数で出す）
 * 値は head のスクリプトが描画前に入れる（app/utils/header-user-snapshot.ts）
 */
export function HomeHeaderAvatarPlaceholder() {
  return (
    <div className="aip-auth-avatar size-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
  )
}

/**
 * ログインの確認が終わるまでのヘッダー右上
 * ログイン中ならお知らせとアイコン、そうでなければログインボタンを、確認を待たずに出す
 */
export function HomeHeaderAuthPlaceholder() {
  const t = useTranslation()

  return (
    <>
      <div className="aip-auth-user flex shrink-0 items-center gap-1.5">
        <div className="aip-auth-bell-box flex size-10 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <BellIcon className="aip-auth-bell size-5" />
        </div>
        <HomeHeaderAvatarPlaceholder />
      </div>
      <div className="aip-auth-guest items-center gap-0.5 md:ml-1 md:gap-1">
        <div className="size-9 md:size-10" />
        <a
          href="/login"
          className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm md:h-10 md:px-4"
        >
          {t("ログイン", "Login")}
        </a>
      </div>
    </>
  )
}
