import type { MetaFunction } from "@remix-run/cloudflare"
import { useOutlet } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { MessageCircleIcon } from "lucide-react"
import { useContext } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { LoginPage } from "~/components/page/login-page"
import { PictorChanSays } from "~/components/pictor-chan-says"
import { Button } from "~/components/ui/button"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SUPPORT_CHAT, undefined, props.params.lang)
}

/**
 * メッセージの一覧
 */
export default function SupportLayout () {
  const authContext = useContext(AuthContext)
  const outlet = useOutlet()
  const t = useTranslation()

  if (authContext.isLoading) {
    return <AppLoadingPage />
  }

  if (authContext.isNotLoggedIn) {
    return <LoginPage />
  }

  // /support そのものには中身がないので、チャットへ案内する
  if (outlet === null) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-4 py-8">
        <h1 className="font-bold text-2xl">{t("サポート", "Support")}</h1>
        <PictorChanSays>
          {t(
            "お困りごとですか？チャットで聞いてみてくださいね！",
            "Need a hand? Try asking in the chat!",
          )}
        </PictorChanSays>
        <Button asChild className="h-11 w-full">
          <Link to="/support/chat">
            <MessageCircleIcon className="mr-2 size-4" />
            {t("チャットで問い合わせる", "Open chat support")}
          </Link>
        </Button>
      </div>
    )
  }

  return outlet
}
