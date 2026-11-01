import { useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql, type ResultOf } from "gql.tada"
import {
  CalendarCheckIcon,
  CheckIcon,
  CrownIcon,
  FlameIcon,
  Loader2Icon,
  ShareIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { AchievementSettingsCard } from "~/components/achievements/achievement-settings-card"
import {
  AchievementShareDialog,
  type AchievementShareTarget,
} from "~/components/achievements/achievement-share-dialog"
import { CoinIcon } from "~/components/coin-icon"
import { LoginDialogButton } from "~/components/login-dialog-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_SERIES_LABELS,
  formatRarity,
  getAchievementTier,
} from "~/lib/achievements/achievement-ui"
import { cn } from "~/lib/utils"

type Achievement = ResultOf<
  typeof achievementsPageQuery
>["achievements"][number]

type Summary = NonNullable<
  ResultOf<typeof achievementsPageQuery>["achievementSummary"]
>

type CategoryValue = (typeof ACHIEVEMENT_CATEGORIES)[number]["value"]

/**
 * 実績ページ（自分のときは進み具合と「もうすぐ達成」も出す）
 */
export function AchievementsPage() {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [searchParams] = useSearchParams()

  const userParam = searchParams.get("user")
  const highlight = searchParams.get("highlight")

  const isViewer =
    userParam === null ||
    (authContext.userId !== null && userParam === authContext.userId)
  const userId = isViewer ? null : userParam

  const { data, loading } = useQuery(achievementsPageQuery, {
    skip: authContext.isLoading || (isViewer && authContext.isNotLoggedIn),
    variables: { userId, ownerId: userId ?? "", isOther: userId !== null },
    fetchPolicy: "cache-and-network",
  })

  const [category, setCategory] = useState<CategoryValue>("ALL")
  const [isUnlockedOnly, setIsUnlockedOnly] = useState(false)
  const [selected, setSelected] = useState<Achievement | null>(null)
  const [shareTarget, setShareTarget] = useState<AchievementShareTarget | null>(
    null,
  )

  const achievements = data?.achievements ?? []
  const summary = data?.achievementSummary ?? null

  // 達成の演出から来たときは、その実績を開く
  const openedHighlightRef = useRef(false)
  useEffect(() => {
    if (openedHighlightRef.current || highlight === null) return
    const target = achievements.find((item) => item.key === highlight)
    if (target) {
      openedHighlightRef.current = true
      setSelected(target)
    }
  }, [achievements, highlight])

  if (isViewer && !authContext.isLoading && authContext.isNotLoggedIn) {
    return <AchievementsLoggedOut />
  }

  if (loading && achievements.length === 0) {
    return (
      <div className="flex justify-center py-24">
        <Loader2Icon className="size-8 animate-spin text-border" />
      </div>
    )
  }

  // 本人が他の人に見せない設定にしている
  if (!isViewer && !loading && summary === null) {
    return (
      <div className="mx-auto max-w-xl space-y-2 py-24 text-center">
        <p className="font-bold text-lg">
          {t(
            "この人は実績を表示しない設定にしています",
            "This user keeps their achievements private",
          )}
        </p>
        <Link to="/achievements" className="text-sm underline">
          {t("自分の実績を見る", "View my achievements")}
        </Link>
      </div>
    )
  }

  const filtered = achievements.filter(
    (item) =>
      (category === "ALL" || item.category === category) &&
      (!isUnlockedOnly || item.isUnlocked),
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <AchievementHero
        summary={summary}
        isViewer={isViewer}
        ownerName={data?.owner?.name ?? null}
        onSelect={(key) =>
          setSelected(achievements.find((item) => item.key === key) ?? null)
        }
        onShare={
          isViewer && authContext.userId
            ? () => setShareTarget({ userId: authContext.userId ?? "" })
            : undefined
        }
      />

      {isViewer && (
        <NextGoals achievements={achievements} onSelect={setSelected} />
      )}

      <div className="-mx-4 sticky top-14 z-10 flex flex-wrap items-center gap-2 bg-background/95 px-4 py-2 backdrop-blur md:top-16">
        {ACHIEVEMENT_CATEGORIES.map((item) => {
          const count = achievements.filter(
            (achievement) =>
              item.value === "ALL" || achievement.category === item.value,
          )
          const unlocked = count.filter((achievement) => achievement.isUnlocked)
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-bold text-sm transition active:scale-95",
                category === item.value
                  ? "border-foreground bg-foreground text-background"
                  : "bg-card hover:bg-muted",
              )}
            >
              {t(item.ja, item.en)}
              <span className="ml-1.5 font-normal text-xs opacity-70">
                {unlocked.length}/{count.length}
              </span>
            </button>
          )
        })}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-muted-foreground text-sm">
          <input
            type="checkbox"
            className="size-4 accent-current"
            checked={isUnlockedOnly}
            onChange={(event) => setIsUnlockedOnly(event.target.checked)}
          />
          {t("達成済みだけ", "Unlocked only")}
        </label>
      </div>

      <AchievementSeriesList
        achievements={filtered}
        isViewer={isViewer}
        onSelect={setSelected}
      />

      {isViewer && (
        <Link
          to="/plus"
          className="flex items-center gap-3 rounded-2xl border border-violet-300/50 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-amber-400/10 p-4 transition hover:shadow-md"
        >
          <CrownIcon className="size-8 shrink-0 text-violet-500" />
          <div className="min-w-0">
            <p className="font-bold">
              {t(
                "Aipictors+ なら実績のコインが2倍",
                "Double achievement coins with Aipictors+",
              )}
            </p>
            <p className="text-muted-foreground text-sm">
              {t(
                "プランに加入している間は、達成でもらえるフリーコインがすべて2倍になります",
                "While subscribed, every achievement gives twice the free coins",
              )}
            </p>
          </div>
        </Link>
      )}

      {isViewer && <AchievementSettingsCard />}

      <AchievementDetailDialog
        achievement={selected}
        isViewer={isViewer}
        onShare={
          isViewer && authContext.userId
            ? (item) => {
                setSelected(null)
                setShareTarget({
                  userId: authContext.userId ?? "",
                  highlight: { key: item.key, name: item.name },
                })
              }
            : undefined
        }
        onClose={() => setSelected(null)}
      />

      <AchievementShareDialog
        target={shareTarget}
        onClose={() => setShareTarget(null)}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 見出し（レベル・数・連続ログイン・見せたい実績）                              */
/* ------------------------------------------------------------------ */

function LevelRing(props: { summary: Summary }) {
  const t = useTranslation()
  const span = props.summary.nextLevelPoints - props.summary.currentLevelPoints
  const ratio =
    span <= 0
      ? 1
      : (props.summary.points - props.summary.currentLevelPoints) / span
  const radius = 52
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative size-32 shrink-0">
      <svg
        aria-hidden="true"
        viewBox="0 0 128 128"
        className="-rotate-90 size-full"
      >
        <defs>
          <linearGradient id="achievement-level" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff4d8d" />
            <stop offset="0.5" stopColor="#ffd166" />
            <stop offset="1" stopColor="#6ecbff" />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#achievement-level)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - Math.min(1, Math.max(0, ratio)))
          }
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-[10px] text-muted-foreground tracking-widest">
          LEVEL
        </span>
        <span className="font-black text-4xl tabular-nums leading-none">
          {props.summary.level}
        </span>
        <span className="mt-1 text-[10px] text-muted-foreground tabular-nums">
          {t(
            `あと ${props.summary.nextLevelPoints - props.summary.points} pt`,
            `${props.summary.nextLevelPoints - props.summary.points} pt to go`,
          )}
        </span>
      </div>
    </div>
  )
}

function AchievementHero(props: {
  summary: Summary | null
  isViewer: boolean
  ownerName: string | null
  onSelect: (key: string) => void
  /** 自分のときだけ（シェアカード） */
  onShare?: () => void
}) {
  const t = useTranslation()
  const summary = props.summary
  if (summary === null) return null

  const unlockedRatio =
    summary.totalCount === 0 ? 0 : summary.unlockedCount / summary.totalCount

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card p-5 md:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,77,141,0.14),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(110,203,255,0.16),transparent_45%),radial-gradient(circle_at_60%_100%,rgba(255,209,102,0.14),transparent_50%)]"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-5">
          <LevelRing summary={summary} />
          <div className="space-y-1">
            <h1 className="font-black text-2xl md:text-3xl">
              {props.isViewer
                ? t("あなたの実績", "Your achievements")
                : t(
                    `${props.ownerName ?? ""}さんの実績`,
                    `${props.ownerName ?? ""}'s achievements`,
                  )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t(
                "創作・応援・毎日の訪問がバッジになります",
                "Creating, cheering and visiting become badges",
              )}
            </p>
            {props.onShare && (
              <button
                type="button"
                onClick={props.onShare}
                className="achievement-shine relative mt-2 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 px-5 py-2.5 font-bold text-sm text-white shadow-lg shadow-pink-500/30 transition hover:scale-[1.03] hover:shadow-pink-500/50 active:scale-95"
              >
                <ShareIcon className="size-4" />
                {t("実績カードをシェア", "Share my card")}
              </button>
            )}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3">
          <div className="col-span-2 space-y-1.5 rounded-2xl bg-background/70 p-3 md:col-span-3">
            <div className="flex items-baseline justify-between">
              <span className="flex items-center gap-1.5 font-bold text-sm">
                <TrophyIcon className="size-4 text-amber-500" />
                {t("達成", "Unlocked")}
              </span>
              <span className="font-black text-xl tabular-nums">
                {summary.unlockedCount}
                <span className="font-normal text-muted-foreground text-sm">
                  {" "}
                  / {summary.totalCount}
                </span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-sky-400 transition-[width] duration-1000"
                style={{ width: `${Math.max(2, unlockedRatio * 100)}%` }}
              />
            </div>
          </div>
          <Stat
            icon={<SparklesIcon className="size-4 text-violet-500" />}
            label={t("実績ポイント", "Points")}
            value={summary.points.toLocaleString()}
          />
          {props.isViewer && (
            <Stat
              icon={
                <FlameIcon
                  className={cn(
                    "size-4",
                    summary.currentStreak >= 2
                      ? "animate-pulse text-orange-500"
                      : "text-muted-foreground",
                  )}
                />
              }
              label={t("連続ログイン", "Streak")}
              value={t(
                `${summary.currentStreak}日`,
                `${summary.currentStreak} days`,
              )}
            />
          )}
          <Stat
            icon={<CalendarCheckIcon className="size-4 text-sky-500" />}
            label={t("ログイン日数", "Days visited")}
            value={t(`${summary.loginDays}日`, `${summary.loginDays} days`)}
          />
        </div>
      </div>

      {summary.featured.length > 0 && (
        <div className="relative mt-5 flex flex-wrap items-end gap-3 border-t pt-4">
          <span className="w-full font-bold text-muted-foreground text-xs">
            {t("自慢のバッジ", "Showcase")}
          </span>
          {summary.featured.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className="hover:-translate-y-1 animate-achievement-cascade transition"
              style={{ animationDelay: `${index * 80}ms` }}
              onClick={() => props.onSelect(item.key)}
              title={t(item.name, item.enName)}
            >
              <AchievementBadge
                achievementKey={item.key}
                name={t(item.name, item.enName)}
                tier={item.tier}
                isHidden={item.isHidden}
                isUnlocked={true}
                size={64}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function Stat(props: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/70 p-3">
      <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {props.icon}
        {props.label}
      </p>
      <p className="font-black text-lg tabular-nums">{props.value}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* もうすぐ達成                                                         */
/* ------------------------------------------------------------------ */

function NextGoals(props: {
  achievements: Achievement[]
  onSelect: (achievement: Achievement) => void
}) {
  const t = useTranslation()
  const goals = useMemo(() => {
    // 種類ごとに次の 1 つだけ。進んでいる順
    const bySeries = new Map<string, Achievement>()
    for (const item of props.achievements) {
      if (item.isUnlocked || item.isHidden) continue
      if (item.progressCurrent === null || item.progressTarget === null)
        continue
      if (!bySeries.has(item.series)) bySeries.set(item.series, item)
    }
    return [...bySeries.values()]
      .map((item) => ({
        item,
        ratio:
          (item.progressCurrent ?? 0) / Math.max(1, item.progressTarget ?? 1),
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 4)
  }, [props.achievements])

  if (goals.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="font-bold text-lg">{t("もうすぐ達成", "Almost there")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {goals.map(({ item, ratio }) => (
          <button
            key={item.key}
            type="button"
            onClick={() => props.onSelect(item)}
            className="group hover:-translate-y-0.5 flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:shadow-md"
          >
            <AchievementBadge
              achievementKey={item.key}
              name={t(item.name, item.enName)}
              tier={item.tier}
              isHidden={item.isHidden}
              isUnlocked={false}
              size={52}
              className="transition group-hover:scale-105"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-bold text-sm">
                {t(item.name, item.enName)}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {t(item.description, item.enDescription)}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500"
                  style={{ width: `${Math.max(3, ratio * 100)}%` }}
                />
              </div>
              <p className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                <span>
                  {(item.progressCurrent ?? 0).toLocaleString()} /{" "}
                  {(item.progressTarget ?? 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 font-bold text-amber-600 dark:text-amber-400">
                  <CoinIcon className="size-3" />+{item.rewardCoins}
                </span>
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 種類ごとの並び（達成した段は色つき、次の段は進み具合の輪）                       */
/* ------------------------------------------------------------------ */

function AchievementSeriesList(props: {
  achievements: Achievement[]
  isViewer: boolean
  onSelect: (achievement: Achievement) => void
}) {
  const t = useTranslation()

  const groups = useMemo(() => {
    const map = new Map<string, Achievement[]>()
    for (const item of props.achievements) {
      const groupKey = item.category === "SPECIAL" ? "special" : item.series
      const list = map.get(groupKey) ?? []
      list.push(item)
      map.set(groupKey, list)
    }
    return [...map.entries()]
  }, [props.achievements])

  // 次の目標が見えるように、各列を横にずらしておく（スマホでは達成済みで埋まって見えないため）
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = listRef.current
    if (root === null || groups.length === 0) return
    for (const next of root.querySelectorAll<HTMLElement>(
      "[data-next='true']",
    )) {
      const track = next.closest("ol")
      if (track === null) continue
      track.scrollLeft = Math.max(
        0,
        next.offsetLeft - track.clientWidth / 2 + next.clientWidth / 2,
      )
    }
  }, [groups])

  if (groups.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {t("まだ達成した実績はありません", "No achievements unlocked yet")}
      </p>
    )
  }

  return (
    <div ref={listRef} className="space-y-4">
      {groups.map(([groupKey, items]) => {
        const label =
          groupKey === "special"
            ? { ja: "特別な実績", en: "Special" }
            : (ACHIEVEMENT_SERIES_LABELS[groupKey] ?? {
                ja: groupKey,
                en: groupKey,
              })
        const unlockedCount = items.filter((item) => item.isUnlocked).length
        const nextIndex = items.findIndex((item) => !item.isUnlocked)
        return (
          <section
            key={groupKey}
            className="rounded-2xl border bg-card p-4"
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "0 180px",
            }}
          >
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="font-bold">{t(label.ja, label.en)}</h2>
              <span className="text-muted-foreground text-xs tabular-nums">
                {unlockedCount} / {items.length}
              </span>
            </div>
            <ol className="-mx-1 relative flex snap-x gap-1 overflow-x-auto px-1 pt-1 pb-2">
              {items.map((item, index) => {
                const isNext = props.isViewer && index === nextIndex
                const ratio =
                  item.progressCurrent !== null && item.progressTarget
                    ? item.progressCurrent / item.progressTarget
                    : 0
                return (
                  <li
                    key={item.key}
                    className="relative shrink-0 snap-start"
                    data-next={isNext ? "true" : undefined}
                  >
                    {/* 段のあいだの線 */}
                    {index > 0 && groupKey !== "special" && (
                      <span
                        aria-hidden
                        className={cn(
                          "-left-2 absolute top-[38px] h-1 w-3 rounded-full",
                          item.isUnlocked ? "bg-amber-400" : "bg-muted",
                        )}
                      />
                    )}
                    <button
                      type="button"
                      id={`achievement-${item.key}`}
                      onClick={() => props.onSelect(item)}
                      className="group flex w-[88px] flex-col items-center gap-1 rounded-xl p-1 transition hover:bg-muted/60 active:scale-95"
                    >
                      <span className="relative">
                        {isNext && <ProgressRing ratio={ratio} />}
                        <AchievementBadge
                          achievementKey={item.key}
                          name={t(item.name, item.enName)}
                          tier={item.tier}
                          isHidden={item.isHidden}
                          isUnlocked={item.isUnlocked}
                          size={72}
                          className={cn(
                            "transition group-hover:scale-110",
                            isNext && "scale-90",
                          )}
                        />
                        {item.isUnlocked && (
                          <span className="-top-0.5 -right-0.5 absolute flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-card">
                            <CheckIcon className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "line-clamp-2 text-center text-[11px] leading-tight",
                          item.isUnlocked
                            ? "font-bold"
                            : "text-muted-foreground",
                        )}
                      >
                        {t(item.name, item.enName)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

function ProgressRing(props: { ratio: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 88 88"
      className="-inset-2 -rotate-90 absolute size-[88px]"
    >
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth="4"
      />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        className="stroke-amber-400"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(1, props.ratio))}
      />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 詳細                                                                */
/* ------------------------------------------------------------------ */

function rarityLabel(rarity: number | null) {
  if (rarity === null) return null
  if (rarity < 0.01) return { ja: "伝説級", en: "Legendary" }
  if (rarity < 0.05) return { ja: "超レア", en: "Ultra rare" }
  if (rarity < 0.15) return { ja: "レア", en: "Rare" }
  if (rarity < 0.4) return { ja: "アンコモン", en: "Uncommon" }
  return { ja: "コモン", en: "Common" }
}

function AchievementDetailDialog(props: {
  achievement: Achievement | null
  isViewer: boolean
  onShare?: (achievement: Achievement) => void
  onClose: () => void
}) {
  const t = useTranslation()
  const item = props.achievement
  const tier = item ? getAchievementTier(item.tier) : null
  const rarity = item ? formatRarity(item.rarity) : null
  const rarityName = item ? rarityLabel(item.rarity ?? null) : null

  return (
    <Dialog
      open={item !== null}
      onOpenChange={(open) => !open && props.onClose()}
    >
      {item && tier && (
        <DialogContent className="max-w-sm overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-60"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${tier.glow}55, transparent 70%)`,
            }}
          />
          <DialogHeader className="relative items-center text-center">
            <div className="relative mx-auto my-2 flex size-44 items-center justify-center">
              {item.isUnlocked && (
                <div
                  aria-hidden
                  className="achievement-rays absolute inset-[-20%] rounded-full"
                  style={
                    { "--achievement-glow": tier.glow } as React.CSSProperties
                  }
                />
              )}
              <div className="relative animate-achievement-pop">
                <AchievementBadge
                  achievementKey={item.key}
                  name={t(item.name, item.enName)}
                  tier={item.tier}
                  isHidden={item.isHidden}
                  isUnlocked={item.isUnlocked}
                  size={160}
                  isInteractive={true}
                />
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 font-bold text-xs shadow-sm",
                tier.chipClassName,
              )}
            >
              {t(tier.ja, tier.en)}
            </span>
            <DialogTitle className="text-xl">
              {t(item.name, item.enName)}
            </DialogTitle>
            <DialogDescription>
              {t(item.description, item.enDescription)}
            </DialogDescription>
          </DialogHeader>

          <div className="relative space-y-3">
            {item.isUnlocked ? (
              <p className="text-center text-muted-foreground text-sm">
                {item.unlockedAt &&
                  t(
                    `${new Date(item.unlockedAt * 1000).toLocaleDateString("ja-JP")} に達成`,
                    `Unlocked on ${new Date(item.unlockedAt * 1000).toLocaleDateString("en-US")}`,
                  )}
              </p>
            ) : (
              props.isViewer &&
              item.progressCurrent !== null &&
              item.progressTarget !== null && (
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500"
                      style={{
                        width: `${Math.max(2, (item.progressCurrent / Math.max(1, item.progressTarget)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-center text-muted-foreground text-xs tabular-nums">
                    {item.progressCurrent.toLocaleString()} /{" "}
                    {item.progressTarget.toLocaleString()}
                  </p>
                </div>
              )
            )}

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-muted/60 p-2">
                <p className="text-[11px] text-muted-foreground">
                  {item.isUnlocked
                    ? t("もらったコイン", "Coins received")
                    : t("達成でもらえる", "Reward")}
                </p>
                <p className="flex items-center justify-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <CoinIcon className="size-4" />
                  {item.rewardCoins}
                </p>
                {!item.isUnlocked && (
                  <p className="text-[10px] text-muted-foreground">
                    {t("プラン加入中は2倍", "x2 with a plan")}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-muted/60 p-2">
                <p className="text-[11px] text-muted-foreground">
                  {t("達成した人", "Unlocked by")}
                </p>
                <p className="font-bold">{rarity ?? "-"}</p>
                {rarityName && (
                  <p className="text-[10px] text-muted-foreground">
                    {t(rarityName.ja, rarityName.en)}
                  </p>
                )}
              </div>
            </div>

            {item.isUnlocked && props.onShare && (
              <button
                type="button"
                onClick={() => props.onShare?.(item)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 font-bold text-white shadow-lg shadow-pink-500/30 transition hover:brightness-110 active:scale-95"
              >
                <ShareIcon className="size-4" />
                {t("この実績をシェア", "Share this achievement")}
              </button>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* ログインしていない人へ                                                 */
/* ------------------------------------------------------------------ */

const SAMPLE_BADGES = [
  { key: "works-1", tier: 1 },
  { key: "likes-received-100", tier: 3 },
  { key: "followers-300", tier: 4 },
  { key: "login-streak-30", tier: 4 },
  { key: "awards-500", tier: 5 },
  { key: "works-10000", tier: 6 },
]

function AchievementsLoggedOut() {
  const t = useTranslation()
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12 text-center">
      <div className="flex flex-wrap justify-center gap-2">
        {SAMPLE_BADGES.map((badge, index) => (
          <div
            key={badge.key}
            className="animate-achievement-cascade"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <AchievementBadge
              achievementKey={badge.key}
              name=""
              tier={badge.tier}
              isHidden={false}
              isUnlocked={true}
              size={72}
            />
          </div>
        ))}
      </div>
      <h1 className="font-black text-3xl">{t("実績", "Achievements")}</h1>
      <p className="text-muted-foreground">
        {t(
          "投稿・いいね・毎日のログインで、180 近いバッジを集めよう。達成するとフリーコインがもらえます。",
          "Collect nearly 180 badges by posting, liking and visiting. Earn free coins for each one.",
        )}
      </p>
      <div className="mx-auto max-w-xs">
        <LoginDialogButton
          label={t("ログインしてはじめる", "Log in to start")}
          isWidthFull={true}
        />
      </div>
    </div>
  )
}

const achievementsPageQuery = graphql(
  `query AchievementsPage($userId: ID, $ownerId: ID!, $isOther: Boolean!) {
    owner: user(id: $ownerId) @include(if: $isOther) {
      id
      name
    }
    achievementSummary(userId: $userId) {
      unlockedCount
      totalCount
      points
      level
      currentLevelPoints
      nextLevelPoints
      currentStreak
      longestStreak
      loginDays
      featured {
        key
        name
        enName
        tier
        isHidden
      }
    }
    achievements(userId: $userId) {
      key
      name
      enName
      description
      enDescription
      category
      series
      tier
      points
      rewardCoins
      isHidden
      isUnlocked
      unlockedAt
      progressCurrent
      progressTarget
      rarity
    }
  }`,
)
