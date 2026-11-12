import { CrownIcon, SparklesIcon, UserPlusIcon } from "lucide-react"
import { CoinIcon } from "~/components/coin-icon"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  rewards: { signup: number; action: number; paid: number }
  /** 紹介リンクから来た未ログインの人（「あなたも招待できます」の見出しにする） */
  isInvitedGuest?: boolean
}

/**
 * もらえるものの説明（友だちが登録 → 生成・投稿 → プランに加入）
 */
export function InviteRewardSteps(props: Props) {
  const t = useTranslation()

  const steps = [
    {
      icon: UserPlusIcon,
      when: t("友だちがリンクから登録", "A friend signs up from your link"),
      who: t("友だちに", "Your friend gets"),
      coins: props.rewards.signup,
    },
    {
      icon: SparklesIcon,
      when: t(
        "友だちがはじめて生成、または作品を投稿",
        "They generate or post for the first time",
      ),
      who: t("あなたに", "You get"),
      coins: props.rewards.action,
    },
    {
      icon: CrownIcon,
      when: t(
        "友だちがはじめてプランに加入",
        "They join a paid plan for the first time",
      ),
      who: t("あなたに", "You get"),
      coins: props.rewards.paid,
    },
  ]

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-xl md:text-2xl">
        {props.isInvitedGuest
          ? t("登録したら、あなたも友だちを招待できます", "Once you join, you can invite friends too")
          : t("もらえるもの", "What you get")}
      </h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step.when}
            className="flex items-center gap-3 rounded-2xl border bg-card p-4 md:flex-col md:items-start md:gap-0"
          >
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-300">
                <step.icon className="size-5" />
              </span>
              <span className="hidden font-bold text-muted-foreground text-xs md:inline">
                {`STEP ${index + 1}`}
              </span>
            </div>
            <div className="min-w-0 md:mt-3">
              <p className="font-bold text-sm leading-snug">{step.when}</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 md:mt-2">
                <span className="text-muted-foreground text-xs">
                  {step.who}
                </span>
                <span className="inline-flex items-center gap-1 font-extrabold text-xl md:text-2xl">
                  <CoinIcon className="size-5 shrink-0 self-center" />
                  {step.coins.toLocaleString()}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t("フリーコイン", "free coins")}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
