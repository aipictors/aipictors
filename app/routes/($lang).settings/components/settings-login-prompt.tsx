import { useLocation } from "@remix-run/react"
import { LogInIcon } from "lucide-react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 未ログインで設定のページを開いたとき。
 * Discord などのアプリ内ブラウザは普段のブラウザとログイン状態が別なので、ここに来ることが多い
 */
export function SettingsLoginPrompt() {
  const t = useTranslation()
  const location = useLocation()
  const isDiscordPage = location.pathname.includes("/settings/discord")

  return (
    <div className="mx-auto w-full max-w-md space-y-4 py-16 text-center">
      <LogInIcon className="mx-auto size-10 text-muted-foreground" />
      <h1 className="font-bold text-xl">
        {t(
          "このページを開くにはログインしてください",
          "Log in to open this page",
        )}
      </h1>
      {isDiscordPage && (
        <p className="text-muted-foreground text-sm leading-6">
          {t(
            "ログインして Discord と連携すると、サーバーの名前の横にレベルや実績のバッジが表示されます。",
            "Log in and link Discord to show your level and achievement badges next to your name in the server.",
          )}
        </p>
      )}
      <div className="mx-auto max-w-xs">
        <LoginDialogButton
          label={t("ログイン", "Log in")}
          isWidthFull={true}
        />
      </div>
      <p className="text-muted-foreground text-xs leading-5">
        {t(
          "アプリ内ブラウザでログインできないときは、Safari や Chrome でこのページを開いてください。",
          "If you can't log in from an in-app browser, open this page in Safari or Chrome.",
        )}
      </p>
    </div>
  )
}
