import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { AchievementLevelIcon } from "~/components/achievements/achievement-level-icon"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { useTranslation } from "~/hooks/use-translation"
import {
  ACHIEVEMENT_LEVEL_TIERS,
  toAchievementLevelTier,
} from "~/lib/achievements/achievement-level-tier"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"

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
 * コメントの名前の横に出す実績（実績レベルの段階の印か、本人が選んだならバッジ）。
 * バッジは押すとその人の実績ページへ、レベルの印は押すとレベルと段階の一覧を出す
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

  const level = props.badge.level
  const { tier, next, index } = toAchievementLevelTier(level)
  const tierName = t(tier.name, tier.enName)

  // 段階の印だけを出し、押すとレベルと段階の一覧を見せる（場所を取らず、名前の横がうるさくならないように）
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full transition hover:scale-110 hover:bg-muted"
        aria-label={t(
          `実績レベル ${level}（${tierName}）`,
          `Achievement level ${level} (${tierName})`,
        )}
        title={t(`Lv.${level} ${tierName}`, `Lv.${level} ${tierName}`)}
      >
        <AchievementLevelIcon tier={tier} size={18} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-3 p-3">
        <div className="flex items-center gap-2.5">
          <AchievementLevelIcon tier={tier} size={36} />
          <div className="min-w-0">
            <p className="font-black text-lg tabular-nums leading-tight">
              Lv.{level}
            </p>
            <p className="text-muted-foreground text-xs">
              {next
                ? t(
                    `${tierName}・Lv.${next.minLevel} で${next.name}`,
                    `${tierName} · ${next.enName} at Lv.${next.minLevel}`,
                  )
                : tierName}
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-5 gap-1">
          {ACHIEVEMENT_LEVEL_TIERS.map((item, i) => (
            <li
              key={item.key}
              className={cn(
                "flex flex-col items-center rounded-md py-1",
                i === index ? "bg-muted ring-1 ring-border" : "",
                i > index ? "opacity-45" : "",
              )}
              title={t(item.name, item.enName)}
            >
              <AchievementLevelIcon tier={item} size={20} />
              <span className="mt-0.5 text-[9px] text-muted-foreground tabular-nums leading-none">
                {item.minLevel}
              </span>
            </li>
          ))}
        </ul>
        <Link
          to={`/achievements?user=${props.userId}`}
          className="block rounded-md border py-1.5 text-center font-medium text-xs transition hover:bg-muted"
        >
          {t("実績を見る", "View achievements")}
        </Link>
      </PopoverContent>
    </Popover>
  )
}
