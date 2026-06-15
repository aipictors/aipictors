import { Link } from "@remix-run/react"
import { CircleDollarSign, Sparkles, TrendingUp, Wallet } from "lucide-react"
import { CoinIcon } from "~/components/coin-icon"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Badge } from "~/components/ui/badge"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  compact?: boolean
}

export function CoinHelpContent (props: Props) {
  const t = useTranslation()
  const sectionClassName = props.compact
    ? "space-y-2 rounded-lg border p-4"
    : "space-y-3 rounded-xl border p-5"

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="font-semibold text-lg">
          {t("コイン・pt・推しの基本", "Coins, pt and support basics")}
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          {t(
            "Aipictors では、画像生成に使うコインと、ユーザーを応援するときの pt が連動しています。どのコインが何に使えるか、ランキングがどう決まるかをここでまとめて確認できます。",
            "On Aipictors, coins used for image generation are also connected to support pt for users. This guide explains what each coin can be used for and how rankings are calculated.",
          )}
        </p>
      </div>

      <div className={sectionClassName}>
        <p className="flex items-center gap-2 font-semibold">
          <CoinIcon className="h-4 w-4 shrink-0" />
          <span>{t("フリーコインとは", "What are free coins?")}</span>
        </p>
        <p className="text-sm leading-6">
          {t(
            "フリーコインは、主に毎日の付与やキャンペーンで受け取る無料コインです。画像生成に使えるほか、ユーザーを応援する用途にも使えます。",
            "Free coins are complimentary coins mainly granted daily or through campaigns. They can be used for image generation and also for supporting users.",
          )}
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          {t(
            "毎日付与されたフリーコインは当日 24:00 に失効します。生成ではプレミアムコインより先に使われます。",
            "Daily granted free coins expire at 24:00 on the same day. They are consumed before premium coins during generation.",
          )}
        </p>
      </div>

      <div className={sectionClassName}>
        <p className="flex items-center gap-2 font-semibold">
          <PremiumCoinIcon className="h-4 w-4 shrink-0" />
          <span>{t("プレミアムコインとは", "What are premium coins?")}</span>
        </p>
        <p className="text-sm leading-6">
          {t(
            "プレミアムコインは購入して増やせるコインです。画像生成や応援に使えます。生成時はフリーコインを先に消費し、足りない分だけプレミアムコインが使われます。",
            "Premium coins are coins you can increase by purchasing. They can be used for image generation and support. During generation, free coins are consumed first and premium coins are used only for the remaining amount.",
          )}
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          {t(
            "購入したプレミアムコインは購入日から 3 か月で失効します。応援で受け取ったプレミアムコインは、交換用の残高として管理される場合があります。",
            "Purchased premium coins expire 3 months after purchase. Premium coins received through support may be managed separately as exchangeable balance.",
          )}
        </p>
      </div>

      <div className={sectionClassName}>
        <p className="flex items-center gap-2 font-semibold">
          <CircleDollarSign className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>{t("pt とは", "What is pt?")}</span>
        </p>
        <p className="text-sm leading-6">
          {t(
            "pt は応援の強さを表すポイントです。フリーコイン 1 枚で 1 pt、プレミアムコイン 1 枚で 10 pt として集計されます。",
            "pt is the score used to represent support strength. One free coin counts as 1 pt, and one premium coin counts as 10 pt.",
          )}
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">1 free coin = 1 pt</Badge>
          <Badge variant="secondary">1 premium coin = 10 pt</Badge>
        </div>
      </div>

      <div className={sectionClassName}>
        <p className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 shrink-0 text-sky-500" />
          <span>{t("推しランキング・貢献度ランキングとは", "What are support and contribution rankings?")}</span>
        </p>
        <p className="text-sm leading-6">
          {t(
            "推しランキングは「どれだけ応援されたか」、貢献度ランキングは「どれだけ応援したか」を週間 pt で集計したランキングです。",
            "The support ranking measures how much support a user received, while the contribution ranking measures how much support a user gave, both based on weekly pt totals.",
          )}
        </p>
        <p className="text-muted-foreground text-sm leading-6">
          {t(
            "累計はサービス開始からの合計値、ランキングページは週ごとの順位です。フリーとプレミアムの内訳を見ると、どの種類の応援が多いかも確認できます。",
            "Cumulative values are the total since the feature started, while ranking pages show weekly standings. The free/premium breakdown helps you see what type of support was used most.",
          )}
        </p>
      </div>

      <div className={sectionClassName}>
        <p className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
          <span>{t("コインの使い道", "How coins can be used")}</span>
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm leading-6">
          <li>
            {t(
              "画像生成: モデルや機能に応じてコインを消費します。",
              "Image generation: coins are consumed depending on the model and features you use.",
            )}
          </li>
          <li>
            {t(
              "推し・応援: ユーザーを応援すると、pt としてランキングに反映されます。",
              "Support: when you support a user, the action is reflected in rankings as pt.",
            )}
          </li>
          <li>
            {t(
              "交換: 応援として受け取った一部プレミアムコインは、条件を満たすと Amazon ギフト券交換に使えます。",
              "Exchange: some premium coins received through support can be used for Amazon gift card exchange when eligible.",
            )}
          </li>
        </ul>
      </div>

      <div className="rounded-lg border border-dashed p-4 text-sm leading-6">
        <p className="flex items-center gap-2 font-semibold">
          <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{t("詳しい画面", "Helpful pages")}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link className="underline underline-offset-4" to="/settings/points">
            {t("コイン設定", "Coin settings")}
          </Link>
          <Link
            className="underline underline-offset-4"
            to="/settings/support-received"
          >
            {t("推された累計と交換", "Received support & exchange")}
          </Link>
          <Link
            className="underline underline-offset-4"
            to="/coin-rankings?kind=received"
          >
            {t("推しランキング", "Support ranking")}
          </Link>
          <Link
            className="underline underline-offset-4"
            to="/coin-rankings?kind=sent"
          >
            {t("貢献度ランキング", "Contribution ranking")}
          </Link>
        </div>
      </div>
    </div>
  )
}