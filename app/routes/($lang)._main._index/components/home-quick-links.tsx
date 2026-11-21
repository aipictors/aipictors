import { ChevronRightIcon, SparklesIcon, TrophyIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { trackGrowthEvent } from "~/utils/track-growth-event"

/**
 * ホームの、ランキングとプランへの大きな入口（アプリのホームと同じ 2 つ並び）。
 * 全年齢のホームでは、その下にスペシャル枠ガチャの細いバナー
 */
export function HomeQuickLinks(props: {
  /** R18 のトップ（ランキングを /r に） */
  isSensitive?: boolean
}) {
  const t = useTranslation()

  return (
    <nav
      aria-label={t("ランキングとプラン", "Ranking and plans")}
      className="grid grid-cols-2 gap-2.5"
    >
      <Link
        to={props.isSensitive ? "/r/rankings" : "/rankings"}
        className="flex h-[52px] items-center gap-2 rounded-2xl bg-amber-500/10 px-3.5 font-extrabold text-sm transition-transform active:scale-[0.97] motion-reduce:transition-none dark:bg-amber-500/20"
      >
        <TrophyIcon className="size-5 shrink-0 text-amber-500" />
        <span className="min-w-0 flex-1 truncate">
          {t("ランキング", "Ranking")}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      <Link
        to="/plus"
        onClick={() => trackGrowthEvent("plus_nav_click", "home_quick_link")}
        className="flex h-[52px] items-center gap-2 rounded-2xl bg-violet-500/10 px-3.5 font-extrabold text-sm transition-transform active:scale-[0.97] motion-reduce:transition-none dark:bg-violet-500/20"
      >
        <SparklesIcon className="size-5 shrink-0 text-violet-500" />
        <span className="min-w-0 flex-1 truncate">{t("プラン", "Plans")}</span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </Link>
      {!props.isSensitive && (
        <Link
          to="/gacha"
          onClick={() => trackGrowthEvent("gacha_nav_click", "home_quick_link")}
          className="group relative col-span-2 flex h-[64px] items-center overflow-hidden rounded-2xl bg-[#2a0f4f] transition-transform active:scale-[0.98] motion-reduce:transition-none"
        >
          <img
            src="/images/gacha/special-gacha-banner.sm.webp"
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover object-[0%_35%]"
          />
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2a0f4f]/40 to-[#2a0f4f]/95" />
          <span className="relative ml-auto flex flex-col items-end pr-3.5 text-right text-white">
            <span className="font-black text-sm drop-shadow">
              {t("スペシャル枠ガチャ", "Special Frame Gacha")}
            </span>
            <span className="font-bold text-[11px] text-amber-200">
              {t(
                "毎日 1 回目はお得・10 連は SR 以上確定",
                "Daily first pull deal",
              )}
            </span>
          </span>
          <ChevronRightIcon className="relative mr-2 size-4 shrink-0 text-white/80" />
        </Link>
      )}
    </nav>
  )
}
