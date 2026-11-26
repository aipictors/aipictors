import { Link } from "@remix-run/react"
import { BanknoteIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

/**
 * Amazon ギフト券交換の終了と、クリエイター報酬（銀行振込）への案内
 */
export function CreatorRewardsNotice(props: { className?: string }) {
  const t = useTranslation()
  return (
    <div
      className={props.className ?? "space-y-3 rounded-md border p-4 text-sm"}
    >
      <div className="flex items-center gap-2 font-bold">
        <BanknoteIcon className="size-4" />
        {t("クリエイター報酬（銀行振込）", "Creator Rewards (bank payout)")}
      </div>
      <p className="text-muted-foreground leading-6">
        {t(
          "Amazon ギフト券への交換は 2026年11月16日で終了しました。代わりに、全年齢のオリジナル作品が有料のプレミアムコインで推されると、1,000 コインにつき 500 円の報酬を銀行口座へ振り込む「クリエイター報酬」が始まりました（参加が必要です）。",
          "Amazon gift card exchange ended on November 16, 2026. Instead, with Creator Rewards you earn ¥500 per 1,000 purchased Premium Coins supported on your all-ages original works, paid to your bank account (joining required).",
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/settings/creator-rewards">
            {t("クリエイター報酬を見る", "Open Creator Rewards")}
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link to="/creator-rewards/terms">{t("規約", "Terms")}</Link>
        </Button>
      </div>
    </div>
  )
}
