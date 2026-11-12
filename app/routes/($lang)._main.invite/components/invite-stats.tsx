import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import type { ReferralSummary } from "~/routes/api.referral.summary/route"

type Props = {
  /** 読み込み中は null */
  summary: ReferralSummary | null
}

/**
 * これまでの紹介人数と受け取ったコイン
 */
export function InviteStats(props: Props) {
  const t = useTranslation()
  const summary = props.summary

  const items = [
    { label: t("紹介した人", "Friends invited"), value: summary?.invitedCount },
    {
      label: t("生成・投稿した人", "Started creating"),
      value: summary?.actionCount,
    },
    { label: t("プランに加入した人", "Joined a plan"), value: summary?.paidCount },
    {
      label: t("受け取ったコイン", "Coins earned"),
      value: summary?.coinsEarned,
    },
  ]

  return (
    <section className="space-y-4">
      <h2 className="font-bold text-xl md:text-2xl">
        {t("これまでの紹介", "Your invites")}
      </h2>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-card p-4">
            <dt className="text-muted-foreground text-xs">{item.label}</dt>
            <dd className="mt-1 font-extrabold text-2xl tabular-nums">
              {item.value === undefined ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                item.value.toLocaleString()
              )}
            </dd>
          </div>
        ))}
      </dl>
      {summary !== null && (
        <p className="text-muted-foreground text-sm">
          {t(
            `今月、特典の対象になった紹介: ${summary.monthlyUsed} / ${summary.monthlyLimit} 人`,
            `Invites counted for rewards this month: ${summary.monthlyUsed} / ${summary.monthlyLimit}`,
          )}
        </p>
      )}
    </section>
  )
}
