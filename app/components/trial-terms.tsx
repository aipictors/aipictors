import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"

type Props = {
  /** 未ログインの人には、対象（はじめての方）を添える */
  isGuest?: boolean
  className?: string
}

/**
 * 無料お試しの条件。お試しのボタンの近くに必ず置く（読める大きさと濃さで）
 */
export function TrialTerms(props: Props) {
  const t = useTranslation()

  return (
    <p
      className={cn(
        "text-foreground/80 text-xs leading-relaxed",
        props.className,
      )}
    >
      {props.isGuest &&
        t(
          "はじめてプランに入る方が対象です。",
          "For people who've never had a paid plan. ",
        )}
      {t(
        "7日間無料、その後 ¥480/月（税込）で自動更新。お試し中に解約すれば料金はかかりません。カードの登録が必要です。",
        `Free for 7 days, then ¥480/mo (${toApproxUsdText(480)}, tax included) and renews automatically. Cancel during the trial and you won't be charged. A card is required.`,
      )}
    </p>
  )
}
