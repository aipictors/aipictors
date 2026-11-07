import {
  HeartIcon,
  SparklesIcon,
  UserPlusIcon,
  WandSparklesIcon,
} from "lucide-react"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ログインしていない人向けの案内（おすすめの途中に 1 回だけ出す）
 * 何ができるようになるかを先に見せて、登録してもらいやすくする
 */
export function HomeGuestJoinCard() {
  const t = useTranslation()

  const items = [
    {
      icon: SparklesIcon,
      text: t("好みに合わせたおすすめ", "Picks tailored to you"),
    },
    {
      icon: UserPlusIcon,
      text: t("好きなクリエイターをフォロー", "Follow your favorite creators"),
    },
    {
      icon: HeartIcon,
      text: t("いいね・コメント・作品の投稿", "Like, comment and post"),
    },
    {
      icon: WandSparklesIcon,
      text: t(
        "毎日無料でAI画像を生成",
        "Generate AI images for free every day",
      ),
    },
  ]

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-sky-500/10 via-background to-pink-500/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="space-y-2">
        <h2 className="font-bold text-base">
          {t(
            "無料でアカウントを作ると、もっと楽しめます",
            "Create a free account to get more out of Aipictors",
          )}
        </h2>
        <ul className="grid grid-cols-1 gap-1 text-muted-foreground text-sm sm:grid-cols-2 sm:gap-x-6">
          {items.map((item) => (
            <li key={item.text} className="flex items-center gap-1.5">
              <item.icon className="size-4 shrink-0 text-foreground" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
      <LoginDialogButton
        label={t("無料ではじめる", "Get started free")}
        className="shrink-0 rounded-full px-6 font-bold"
      />
    </section>
  )
}
