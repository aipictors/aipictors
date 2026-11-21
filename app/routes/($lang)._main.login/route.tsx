import type { MetaFunction } from "@remix-run/cloudflare"
import { HeartIcon, TrophyIcon, WandSparklesIcon } from "lucide-react"
import { LoginCard } from "~/components/login-card"
import { META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { LoginForm } from "~/routes/($lang)._main.login/components/login-form"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.LOGIN, undefined, props.params.lang)
}

/**
 * ログイン画面
 */
export default function Login() {
  const t = useTranslation()

  const benefits = [
    {
      Icon: HeartIcon,
      text: t(
        "好きな作品にいいねして、作者をフォロー",
        "Like works and follow creators",
      ),
      shortText: t("いいね・フォロー", "Like & follow"),
    },
    {
      Icon: WandSparklesIcon,
      text: t("画像生成と作品の投稿", "Generate images and post your works"),
      shortText: t("画像生成・投稿", "Generate & post"),
    },
    {
      Icon: TrophyIcon,
      text: t(
        "実績のバッジを集めてフリーコインをもらう",
        "Collect achievement badges and earn free coins",
      ),
      shortText: t("バッジでコイン", "Badges & coins"),
    },
  ]

  return (
    <div className="container flex justify-center gap-10 px-3 py-4 md:py-8 lg:items-center lg:justify-center">
      <div className="hidden max-w-sm flex-1 items-center gap-6 lg:flex">
        <img
          src="/images/pictor-chan/run.webp"
          alt=""
          width={160}
          height={316}
          className="motion-safe:hover:-translate-y-1.5 h-64 w-auto shrink-0 transition-transform duration-300"
        />
        <div className="space-y-4">
          <p className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm leading-relaxed">
            {t(
              "おかえりなさい！はじめての方も、ようこそAipictorsへ！",
              "Welcome back! And if you're new, welcome to Aipictors!",
            )}
          </p>
          <ul className="space-y-2 text-muted-foreground text-sm">
            {benefits.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2">
                <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex w-full max-w-md flex-col gap-4">
        <LoginCard
          title={t("ログイン・新規登録", "Log in or sign up")}
          line={t(
            "今日はどんな作品に会えるでしょう？",
            "What works will you find today?",
          )}
        >
          <LoginForm />
        </LoginCard>
        {/* スマホでは横の説明が出ないので、カードの下に短く出す */}
        <ul className="grid grid-cols-3 gap-2 lg:hidden">
          {benefits.map(({ Icon, shortText }) => (
            <li
              key={shortText}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-muted/60 px-2 py-3 text-center text-[11px] text-muted-foreground leading-snug"
            >
              <Icon aria-hidden="true" className="size-4 text-foreground" />
              {shortText}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
