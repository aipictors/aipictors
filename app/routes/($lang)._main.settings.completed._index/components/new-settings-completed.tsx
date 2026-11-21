import { useSearchParams } from "@remix-run/react"
import {
  ChevronRightIcon,
  HashIcon,
  Palette,
  Sparkles,
  Star,
  UserCheckIcon,
  Users,
} from "lucide-react"
import { ConfettiBurst } from "~/components/confetti-burst"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

/**
 * 登録が終わったときのページ。紙吹雪でお祝いして、最初にやることを選んでもらう
 */
export function NewSettingsCompleted() {
  const t = useTranslation()
  const [searchParams] = useSearchParams()
  const tagCount = Number(searchParams.get("tags") ?? 0)
  const followCount = Number(searchParams.get("follows") ?? 0)

  const actions = [
    ...(followCount > 0
      ? [
          {
            to: "/follow-user-works",
            icon: UserCheckIcon,
            title: t(
              "フォローした人の新着を見る",
              "See works from people you follow",
            ),
            text: t(
              `フォローした ${followCount} 人の新しい作品`,
              `New works from ${followCount} creators`,
            ),
            tone: "from-pink-400 to-rose-500",
          },
        ]
      : []),
    ...(tagCount > 0
      ? [
          {
            to: "/follow-tag-works",
            icon: HashIcon,
            title: t("お気に入りタグの新着を見る", "See your favorite tags"),
            text: t(
              `選んだ ${tagCount} 個のタグの新しい作品`,
              `New works from your ${tagCount} tags`,
            ),
            tone: "from-cyan-400 to-teal-500",
          },
        ]
      : []),
    {
      to: "/generation",
      icon: Sparkles,
      title: t("AIで画像を作ってみる", "Try AI image generation"),
      text: t(
        "無料で生成できます。かんたんな言葉からでOK",
        "Free to start. Simple words are fine",
      ),
      tone: "from-violet-400 to-fuchsia-500",
    },
    {
      to: "/new/image",
      icon: Palette,
      title: t("作品を投稿してみる", "Post your work"),
      text: t(
        "あなたの作品をたくさんの人に見てもらおう",
        "Share your work with lots of people",
      ),
      tone: "from-sky-400 to-blue-500",
    },
    {
      to: "/",
      icon: Star,
      title: t("みんなの作品を見る", "Browse works"),
      text: t("いいねやコメントで交流しよう", "Say hi with likes and comments"),
      tone: "from-amber-400 to-orange-500",
    },
    ...(tagCount > 0 || followCount > 0
      ? []
      : [
          {
            to: "/users",
            icon: Users,
            title: t("クリエイターを探す", "Discover creators"),
            text: t(
              "フォローすると新しい作品がすぐ届きます",
              "Follow to get their new works first",
            ),
            tone: "from-emerald-400 to-teal-500",
          },
        ]),
  ]

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-3 pt-6 pb-12 md:pt-10">
      <ConfettiBurst />

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-100 via-teal-50 to-orange-100 px-5 pt-6 pb-0 text-center dark:from-cyan-950/50 dark:via-teal-950/30 dark:to-orange-950/40">
        <div className="-top-12 -left-10 pointer-events-none absolute size-40 rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="-right-10 pointer-events-none absolute bottom-0 size-40 rounded-full bg-orange-300/40 blur-3xl" />
        <p className="relative font-bold text-sm text-teal-600 tracking-widest dark:text-teal-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
          WELCOME!
        </p>
        <h1 className="relative mt-1 font-bold text-3xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-90 motion-safe:duration-500">
          {t("準備ができました！", "You're all set!")}
        </h1>
        <p className="relative mt-2 text-muted-foreground text-sm">
          {t(
            "これであなたもAipictorsの仲間です 🎉",
            "Welcome to the Aipictors community 🎉",
          )}
        </p>
        <img
          src="/images/pictor-chan/gacha-nice.webp"
          alt=""
          width={150}
          height={200}
          fetchPriority="high"
          className="relative mx-auto mt-3 h-[180px] w-auto drop-shadow-lg motion-safe:animate-[aip-float_3.2s_ease-in-out_infinite]"
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-bold">
          {t("さあ、何からはじめる？", "What would you like to do first?")}
        </h2>
        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li
              key={action.to}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both motion-safe:duration-500"
              style={{ animationDelay: `${300 + index * 80}ms` }}
            >
              <Link
                to={action.to}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-0.5 hover:shadow-md",
                  index === 0 && "border-teal-300 dark:border-teal-700",
                )}
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                    action.tone,
                  )}
                >
                  <action.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-sm">
                    {action.title}
                  </span>
                  <span className="block truncate text-muted-foreground text-xs">
                    {action.text}
                  </span>
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-muted-foreground text-xs">
        {t(
          "プロフィールや表示設定は、いつでも ",
          "You can change your profile and display settings anytime in ",
        )}
        <Link to="/settings" className="underline underline-offset-2">
          {t("設定", "Settings")}
        </Link>
        {t(" から変えられます。", ".")}
      </p>
    </div>
  )
}
