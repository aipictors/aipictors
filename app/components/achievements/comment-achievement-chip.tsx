import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

export type CommentAchievementBadge = {
  level: number
  achievement: {
    key: string
    name: string
    enName: string
    tier: number
    isHidden: boolean
  } | null
}

type Props = {
  userId: string
  badge?: CommentAchievementBadge | null
}

/**
 * コメントの名前の横に出す実績（実績レベルか、本人が選んだならバッジ）。押すとその人の実績ページへ
 */
export function CommentAchievementChip(props: Props) {
  const t = useTranslation()

  if (!props.badge) return null

  const achievement = props.badge.achievement

  if (achievement !== null) {
    const name = t(achievement.name, achievement.enName)
    return (
      <Link
        to={`/achievements?user=${props.userId}`}
        className="inline-flex shrink-0 items-center transition hover:scale-110"
        aria-label={t(`実績「${name}」`, `Achievement: ${name}`)}
        title={name}
      >
        <AchievementBadge
          achievementKey={achievement.key}
          name={name}
          tier={achievement.tier}
          isHidden={achievement.isHidden}
          isUnlocked={true}
          size={22}
        />
      </Link>
    )
  }

  return (
    <Link
      to={`/achievements?user=${props.userId}`}
      className="inline-flex h-[18px] shrink-0 items-center rounded-full border bg-muted/60 px-1.5 font-semibold text-[10px] text-muted-foreground tabular-nums leading-none transition hover:bg-muted hover:text-foreground"
      aria-label={t(
        `実績レベル ${props.badge.level}`,
        `Achievement level ${props.badge.level}`,
      )}
      title={t("実績を見る", "View achievements")}
    >
      Lv.{props.badge.level}
    </Link>
  )
}
