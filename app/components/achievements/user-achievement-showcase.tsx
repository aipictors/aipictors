import { useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  userId: string
}

/**
 * プロフィールに出す実績（実績レベルと自慢のバッジ）。押すとその人の実績ページへ
 */
export function UserAchievementShowcase(props: Props) {
  const t = useTranslation()

  const { data } = useQuery(userAchievementShowcaseQuery, {
    variables: { userId: props.userId },
    fetchPolicy: "cache-first",
  })

  const summary = data?.achievementSummary
  if (!summary || summary.unlockedCount === 0) {
    return null
  }

  return (
    <Link
      to={`/achievements?user=${props.userId}`}
      className="group inline-flex max-w-full items-center gap-2 rounded-full border bg-card/80 py-1 pr-3 pl-1 transition hover:shadow-md"
      aria-label={t("実績を見る", "View achievements")}
    >
      <span className="flex h-7 shrink-0 items-center rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-sky-400 px-2.5 font-black text-white text-xs shadow-sm">
        Lv.{summary.level}
      </span>
      <span className="-space-x-1.5 flex items-center">
        {summary.featured.slice(0, 5).map((item) => (
          <AchievementBadge
            key={item.key}
            achievementKey={item.key}
            name={t(item.name, item.enName)}
            tier={item.tier}
            isHidden={item.isHidden}
            isUnlocked={true}
            size={30}
            className="group-hover:-translate-y-0.5 transition"
          />
        ))}
      </span>
      <span className="whitespace-nowrap text-muted-foreground text-xs tabular-nums">
        {t(
          `実績 ${summary.unlockedCount}`,
          `${summary.unlockedCount} achievements`,
        )}
      </span>
    </Link>
  )
}

const userAchievementShowcaseQuery = graphql(
  `query UserAchievementShowcase($userId: ID) {
    achievementSummary(userId: $userId) {
      level
      unlockedCount
      featured {
        key
        name
        enName
        tier
        isHidden
      }
    }
  }`,
)
