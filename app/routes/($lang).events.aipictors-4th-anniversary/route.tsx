import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BarChart3Icon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CpuIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  HashIcon,
  HeartIcon,
  HistoryIcon,
  ImageIcon,
  LockIcon,
  PartyPopperIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react"
import { useContext, useState } from "react"
import { AchievementBadge } from "~/components/achievements/achievement-badge"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import {
  ANNIVERSARY_4TH_MONTHLY_HIGHLIGHTS,
  ANNIVERSARY_4TH_WALL_WORKS,
  ANNIVERSARY_4TH_YEARLY_MORE_WORKS,
  type Anniversary4thGalleryWork,
} from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-gallery"
import {
  ANNIVERSARY_4TH_STATS,
  toCumulativeYearly,
} from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-stats"
import {
  formatNumber,
  MonthlyBars,
  ShareBarsTabs,
  StackedShare,
  WeekHourHeatmap,
} from "~/routes/($lang).events.aipictors-4th-anniversary/components/anniversary-charts"
import {
  AnniversaryKeyframes,
  CountUp,
  FallingConfetti,
  HeroWorkWall,
  MonthlyTimeline,
  Reveal,
  ScrollProgress,
  WorkMarqueeRows,
  WorkMasonry,
} from "~/routes/($lang).events.aipictors-4th-anniversary/components/anniversary-motion"
import { findMilestones } from "~/routes/($lang).events.aipictors-4th-anniversary/utils/find-milestones"
import { createMeta } from "~/utils/create-meta"

const SLUG = "aipictors-4th-anniversary"
const PRELUDE_SLUG = "before4th"
const TAG = "!Aipictors4周年"
const BANNER =
  "https://www.aipictors.com/images/events/aipictors-4th-anniversary.jpg"

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const pageParam = Number(url.searchParams.get("page") ?? "0")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0
  const where = {
    ratings: ["G"] as "G"[],
    isNowCreatedAt: true,
  }

  const [eventResp, preludeResp] = await Promise.all([
    loaderClient
      .query({
        query: appEventQuery,
        variables: { slug: SLUG, limit: 64, offset: page * 64, where },
      })
      .catch(() => null),
    loaderClient
      .query({
        query: appEventQuery,
        variables: { slug: PRELUDE_SLUG, limit: 64, offset: 0, where },
      })
      .catch(() => null),
  ])

  return {
    event: eventResp?.data.appEvent ?? null,
    prelude: preludeResp?.data.appEvent ?? null,
    page,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(
    META.EVENTS_INDEX,
    {
      title: "Aipictors 4周年記念祭",
      enTitle: "Aipictors 4th Anniversary",
      description:
        "Aipictorsは4周年を迎えました。投稿数・生成数・よく使われたモデルなど4年分のデータと、期間限定の実績がもらえる記念イベント（2026年11月21日〜12月6日）。",
      enDescription:
        "Aipictors turns 4! Four years of data — works, generations, most-used models — and a limited-time event with exclusive achievements (Nov 21 – Dec 6, 2026).",
      url: BANNER,
    },
    props.params.lang,
  )
}

const LIMITED_ACHIEVEMENTS = [
  {
    key: "limited-anniversary-4th-visit",
    tier: 3,
    name: { ja: "4周年おめでとう！", en: "Happy 4th Anniversary!" },
    how: {
      ja: "期間中にAipictorsを開く（ログインが必要です）",
      en: "Open Aipictors during the event (sign in required)",
    },
    isSecret: false,
  },
  {
    key: "limited-anniversary-4th-post",
    tier: 4,
    name: { ja: "4周年の記念作品", en: "4th Anniversary Artwork" },
    how: {
      ja: `「${TAG}」タグを付けて作品を投稿する`,
      en: `Post a work tagged "${TAG}"`,
    },
    isSecret: false,
  },
  {
    key: "limited-anniversary-4th-pioneer",
    tier: 5,
    name: { ja: "？？？", en: "???" },
    how: {
      ja: "ひみつの実績。ずっと前からAipictorsにいる人は…？",
      en: "A secret achievement. Maybe for those who have been here a long time…?",
    },
    isSecret: true,
  },
] as const

/**
 * Aipictors 4 周年の特設ページ（4 年分のデータ・記念作品・期間限定の実績）
 */
export default function Aipictors4thAnniversary() {
  const t = useTranslation()
  const data = useLoaderData<typeof loader>()
  const stats = ANNIVERSARY_4TH_STATS
  const authContext = useContext(AuthContext)
  const [galleryTab, setGalleryTab] = useState<"event" | "prelude">("event")
  // 記念作品ギャラリーは全年齢だけを出し、ボタンを押した人にだけ R15・R18・R18G も出す
  const [isR15Shown, setIsR15Shown] = useState(false)
  const [isAdultShown, setIsAdultShown] = useState(false)
  const galleryRatings: IntrospectionEnum<"Rating">[] = [
    "G",
    ...(isR15Shown ? (["R15"] as const) : []),
    ...(isAdultShown ? (["R18", "R18G"] as const) : []),
  ]

  const { data: achievementsData } = useQuery(viewerAchievementsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { userId: authContext.userId ?? null },
  })
  const unlockedKeys = new Set(
    (achievementsData?.achievements ?? [])
      .filter((item) => item.isUnlocked)
      .map((item) => item.key),
  )

  // 年ごとの数は年によって減って見えるので、年末までの累計で見せる
  const cumulativeYearly = toCumulativeYearly(stats.yearly)

  const milestones = findMilestones(stats.monthly)

  const yearTopThumbnail = (year: number) =>
    stats.yearlyTopWorks.find((group) => group.year === year)?.works[0]
      ?.thumbnail

  const lastYear = (value: number | null, current: number) =>
    value === null || value <= 0
      ? null
      : t(
          `去年から +${formatNumber(current - value)}`,
          `+${formatNumber(current - value)} since last year`,
        )

  return (
    <div className="min-h-screen">
      <AnniversaryKeyframes />
      <ScrollProgress />
      {/* ヒーロー: 4 年分の作品が流れる壁の上にタイトル */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-violet-950 text-white md:min-h-[92vh]">
        <HeroWorkWall works={ANNIVERSARY_4TH_WALL_WORKS.slice(0, 84)} />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/85 via-fuchsia-900/55 to-pink-700/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(46,16,101,0.75)_80%)]" />
        <FallingConfetti />
        <div className="container relative mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="space-y-6">
            <span className="inline-flex animate-[anniv4-pop_0.8s_ease-out_both] items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 font-bold text-sm text-violet-700 shadow-lg motion-reduce:animate-none">
              <SparklesIcon className="size-4" />
              Aipictors 4th Anniversary
            </span>
            <h1 className="animate-[anniv4-pop_1s_ease-out_0.15s_both] font-black leading-none drop-shadow-2xl motion-reduce:animate-none">
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="-inset-6 absolute animate-[anniv4-spin_14s_linear_infinite] rounded-full border-4 border-white/25 border-dashed motion-reduce:animate-none"
                />
                <span className="relative animate-[anniv4-shine_4s_linear_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,#fde047,#f9a8d4,#a5f3fc,#c4b5fd,#fde047)] bg-clip-text text-[8rem] text-transparent motion-reduce:animate-none md:text-[12rem]">
                  4
                </span>
              </span>
              <span className="ml-2 text-4xl md:text-6xl">
                {t("周年", "th")}
              </span>
              <br />
              <span className="text-5xl md:text-7xl">
                {t("記念祭", "Anniversary")}
              </span>
            </h1>
            <p className="animate-[anniv4-pop_1s_ease-out_0.3s_both] font-bold text-xl tracking-widest motion-reduce:animate-none md:text-2xl">
              2026.11.21 – 12.06
            </p>
            <div className="grid max-w-lg animate-[anniv4-pop_1s_ease-out_0.45s_both] grid-cols-3 gap-2 motion-reduce:animate-none">
              {stats.totals
                .filter((item) =>
                  ["works", "users", "likes"].includes(item.key),
                )
                .map((item) => (
                  <div
                    key={item.key}
                    className="min-w-0 rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur md:p-3"
                  >
                    <div className="truncate text-[10px] text-white/75 md:text-[11px]">
                      {t(item.label, item.enLabel)}
                    </div>
                    <div className="font-black text-sm sm:text-lg md:text-2xl">
                      <CountUp value={item.value} />
                    </div>
                  </div>
                ))}
            </div>
            <p className="max-w-xl text-white/90 leading-relaxed">
              {t(
                "2022年に始まったAipictorsは、4周年を迎えました。作品を投稿してくれた方、いいねやコメントで応援してくれた方、生成を楽しんでくれた方、本当にありがとうございます。みんなで積み重ねてきた4年分の記録を、少しだけのぞいてみませんか。",
                "Aipictors, which started in 2022, is now four years old. Thank you to everyone who posted, liked, commented and generated with us. Take a look at the four years we have built together.",
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/new/image?tag=${encodeURIComponent(TAG)}`}>
                <Button
                  size="lg"
                  className="bg-white font-bold text-fuchsia-700 shadow-xl transition hover:scale-105 hover:bg-white/90"
                >
                  <ImageIcon className="mr-2 size-5" />
                  {t("記念作品を投稿する", "Post your artwork")}
                </Button>
              </Link>
              <a href="#limited-achievements">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-transparent font-bold text-white transition hover:scale-105 hover:bg-white/10 hover:text-white"
                >
                  <TrophyIcon className="mr-2 size-5" />
                  {t("限定実績を見る", "Limited achievements")}
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="-inset-4 absolute rounded-3xl bg-gradient-to-r from-amber-300 via-pink-400 to-violet-400 opacity-60 blur-2xl" />
            <img
              src="/images/events/aipictors-4th-anniversary.webp"
              alt={t("Aipictors 4周年記念祭", "Aipictors 4th Anniversary")}
              width={1200}
              height={630}
              className="relative w-full animate-[anniv4-float_6s_ease-in-out_infinite] rounded-2xl shadow-2xl ring-4 ring-white/40 motion-reduce:animate-none"
            />
          </div>
        </div>
        <a
          href="#numbers"
          aria-label={t("下へ", "Scroll down")}
          className="-translate-x-1/2 absolute bottom-5 left-1/2 hidden animate-bounce text-sm text-white/80 motion-reduce:animate-none md:block"
        >
          ▼ SCROLL
        </a>
      </section>

      <div className="bg-gradient-to-r from-violet-950 via-fuchsia-950 to-violet-950">
        <WorkMarqueeRows works={ANNIVERSARY_4TH_WALL_WORKS} rows={2} />
      </div>

      <div className="container mx-auto max-w-6xl space-y-16 px-4 py-12">
        {/* 大きな数字 */}
        <section id="numbers" className="scroll-mt-20 space-y-4">
          <SectionTitle
            icon={<BarChart3Icon className="size-6" />}
            title={t("4年間でつくったもの", "Four years in numbers")}
            note={t(
              `${stats.asOf.replaceAll("-", "/")} 時点`,
              `As of ${stats.asOf}`,
            )}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.totals.map((item, index) => (
              <Reveal
                key={item.key}
                delay={(index % 4) * 90}
                className="group hover:-translate-y-1 relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-lg"
              >
                <div className="-right-6 -top-6 absolute size-20 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-violet-400/20 transition duration-500 group-hover:scale-150" />
                <div className="text-muted-foreground text-xs">
                  {t(item.label, item.enLabel)}
                </div>
                <div className="mt-1 bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text font-black text-transparent text-xl tabular-nums md:text-2xl lg:text-3xl">
                  {item.value >= 100_000_000 ? (
                    <CountUp
                      value={item.value}
                      format={(value) =>
                        t(
                          `${(value / 100_000_000).toFixed(2)}億`,
                          `${Math.round(value / 1_000_000)}M`,
                        )
                      }
                    />
                  ) : (
                    <CountUp value={item.value} />
                  )}
                </div>
                {lastYear(item.lastYear, item.value) && (
                  <div className="mt-1 text-emerald-600 text-xs dark:text-emerald-400">
                    {lastYear(item.lastYear, item.value)}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </section>

        {/* 月ごとのいちばん人気の作品 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<HistoryIcon className="size-6" />}
            title={t("49か月のタイムライン", "49-month timeline")}
          />
          <p className="text-muted-foreground text-sm">
            {t(
              "2022年11月のはじまりから今月まで、その月にいちばんいいねを集めた全年齢の作品を並べました。横にスワイプしてさかのぼってみてください。",
              "From our first month in November 2022 to now — the all-ages work with the most likes each month. Swipe to travel through time.",
            )}
          </p>
          <Reveal>
            <MonthlyTimeline
              items={ANNIVERSARY_4TH_MONTHLY_HIGHLIGHTS}
              milestones={milestones}
            />
          </Reveal>
        </section>

        {/* 月ごとの推移 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<CalendarIcon className="size-6" />}
            title={t("4年間のあゆみ", "Month by month")}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title={t("投稿された作品（累計）", "Total works posted")}
            >
              <MonthlyBars
                points={stats.monthly.map((item) => ({
                  month: item.month,
                  value: item.works,
                }))}
                colorClassName="from-violet-500 to-fuchsia-400"
                unit={t("作品", " works")}
              />
            </ChartCard>
            <ChartCard title={t("登録した人（累計）", "Total members")}>
              <MonthlyBars
                points={stats.monthly.map((item) => ({
                  month: item.month,
                  value: item.registrations,
                }))}
                colorClassName="from-sky-500 to-cyan-400"
                unit={t("人", " people")}
              />
            </ChartCard>
            {stats.monthly.some((item) => item.generations !== null) && (
              <ChartCard
                title={t(
                  "生成機で作られた画像（累計・記録のある2025年7月から）",
                  "Total images made with the generator (records since Jul 2025)",
                )}
                className="lg:col-span-2"
              >
                <MonthlyBars
                  points={stats.monthly
                    .filter((item) => item.generations !== null)
                    .map((item) => ({
                      month: item.month,
                      value: item.generations ?? 0,
                    }))}
                  colorClassName="from-pink-500 to-orange-400"
                  unit={t("枚", " images")}
                />
              </ChartCard>
            )}
          </div>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs">
                <tr>
                  <th className="px-4 py-2 text-left">{t("年", "Year")}</th>
                  <th className="px-4 py-2 text-right">
                    {t("作品（累計）", "Works (total)")}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {t("登録した人（累計）", "Members (total)")}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {t("生成（累計）", "Generations (total)")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {cumulativeYearly.map((item) => (
                  <tr key={item.year} className="border-t">
                    <td className="px-4 py-2 font-bold">
                      <span className="flex items-center gap-2">
                        {yearTopThumbnail(item.year) && (
                          <img
                            src={yearTopThumbnail(item.year)}
                            alt=""
                            loading="lazy"
                            className="size-9 rounded-md object-cover"
                          />
                        )}
                        {item.year}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatNumber(item.works)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatNumber(item.registrations)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {item.generations === null
                        ? "—"
                        : formatNumber(item.generations)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t px-4 py-2 text-muted-foreground text-xs">
              {t(
                "各年の終わりまでの累計です。生成の数は、記録が残っている2025年7月からの分です。2026年は11月20日まで（11月は予約投稿を含みます）。",
                "Running totals at the end of each year. Generation counts only cover records kept since July 2025. 2026 is through November 20 (November includes scheduled posts).",
              )}
            </p>
          </div>
        </section>

        {/* 年ごとの人気作品 */}
        {stats.yearlyTopWorks.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              icon={<HeartIcon className="size-6" />}
              title={t(
                "その年いちばん愛された作品",
                "Most-loved works by year",
              )}
            />
            <p className="text-muted-foreground text-sm">
              {t(
                "毎年、いいねがたくさん集まった全年齢の作品です（1人1作品）。",
                "All-ages works that collected the most likes each year (one per creator).",
              )}
            </p>
            <YearlyTopWorks
              groups={stats.yearlyTopWorks}
              more={ANNIVERSARY_4TH_YEARLY_MORE_WORKS}
            />
          </section>
        )}

        {/* モデルの利用率 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<CpuIcon className="size-6" />}
            title={t("よく使われたモデル", "Most-used models")}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {stats.generationModels.length > 0 && (
              <ChartCard
                title={t(
                  "Aipictorsの生成機で使われたモデル",
                  "Models used in the Aipictors generator",
                )}
              >
                <ShareBarsTabs
                  tabs={stats.generationModels.map((group) => ({
                    key: group.key,
                    label: t(group.label, group.enLabel),
                    items: group.items,
                  }))}
                  unit={t("回", "")}
                  thumbnails={stats.modelThumbnails}
                />
              </ChartCard>
            )}
            {stats.postedModels.length > 0 && (
              <ChartCard
                title={t(
                  "投稿された作品に書かれていたモデル",
                  "Models listed on posted works",
                )}
              >
                <ShareBarsTabs
                  tabs={stats.postedModels.map((group) => ({
                    key: group.key,
                    label: t(group.label, group.enLabel),
                    items: group.items,
                  }))}
                  unit={t("作品", "")}
                  thumbnails={stats.modelThumbnails}
                />
              </ChartCard>
            )}
          </div>
        </section>

        {/* タグ */}
        {stats.tags.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              icon={<HashIcon className="size-6" />}
              title={t("人気のタグ", "Popular tags")}
            />
            <TagCloud groups={stats.tags} thumbnails={stats.tagThumbnails} />
          </section>
        )}

        {/* 時間帯・割合 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<ClockIcon className="size-6" />}
            title={t("いつ・どんな作品が", "When and what")}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {stats.postHeatmap.length === 7 && (
              <ChartCard
                title={t(
                  "投稿の多い曜日と時間（日本時間）",
                  "Posts by weekday and hour (JST)",
                )}
                className="lg:col-span-2"
              >
                <WeekHourHeatmap values={stats.postHeatmap} />
                <p className="mt-2 text-muted-foreground text-xs">
                  {t(
                    "0時は予約投稿の初期設定の時刻なので、特に多くなっています。",
                    "Midnight is the default time for scheduled posts, so it stands out.",
                  )}
                </p>
              </ChartCard>
            )}
            {stats.workTypes.length > 0 && (
              <ChartCard title={t("作品の種類", "Work types")}>
                <StackedShare
                  items={stats.workTypes.map((item, index) => ({
                    label: t(item.label, item.enLabel),
                    share: item.share,
                    className: STACK_COLORS[index % STACK_COLORS.length] ?? "",
                  }))}
                />
              </ChartCard>
            )}
            {stats.ratings.length > 0 && (
              <ChartCard title={t("年齢区分", "Age ratings")}>
                <StackedShare
                  items={stats.ratings.map((item, index) => ({
                    label: item.label,
                    share: item.share,
                    className: STACK_COLORS[index % STACK_COLORS.length] ?? "",
                  }))}
                />
              </ChartCard>
            )}
            {stats.countries.length > 0 && (
              <ChartCard
                title={
                  <span className="flex items-center gap-1.5">
                    <GlobeIcon className="size-4" />
                    {t(
                      "どこから見られている？（直近のページ表示）",
                      "Where visitors come from (recent page views)",
                    )}
                  </span>
                }
                className="lg:col-span-2"
              >
                <StackedShare
                  items={stats.countries.map((item, index) => ({
                    label: t(item.label, item.enLabel),
                    share: item.share,
                    className: STACK_COLORS[index % STACK_COLORS.length] ?? "",
                  }))}
                />
              </ChartCard>
            )}
          </div>
        </section>

        {/* ちょっとした数字 */}
        {stats.facts.length > 0 && (
          <section className="space-y-4">
            <SectionTitle
              icon={<SparklesIcon className="size-6" />}
              title={t("ちょっとした記録", "Fun facts")}
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {stats.facts.map((item, index) => (
                <Reveal
                  key={item.label}
                  from="zoom"
                  delay={index * 90}
                  className="hover:-translate-y-1 rounded-2xl border bg-gradient-to-br from-fuchsia-50 to-violet-50 p-4 transition hover:shadow-lg dark:from-fuchsia-950/40 dark:to-violet-950/40"
                >
                  <div className="text-muted-foreground text-xs">
                    {t(item.label, item.enLabel)}
                  </div>
                  <div className="mt-1 font-bold text-xl">
                    {t(item.value, item.enValue ?? item.value)}
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* 限定実績 */}
        <section id="limited-achievements" className="scroll-mt-20 space-y-4">
          <SectionTitle
            icon={<TrophyIcon className="size-6" />}
            title={t("期間限定の実績", "Limited-time achievements")}
            note="11/21 – 12/06"
          />
          <p className="text-muted-foreground text-sm">
            {t(
              "4周年の期間中だけ手に入る実績です。ふだんの実績一覧には出てきませんが、手に入れると一覧の一番下に「限定実績」として追加されます。実績のコインももらえます。",
              "These achievements can only be earned during the anniversary. They don't appear in your achievement list until you earn them — then they're added at the very bottom under \"Limited\", with achievement coins.",
            )}
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {LIMITED_ACHIEVEMENTS.map((item, index) => {
              const isUnlocked = unlockedKeys.has(item.key)
              const isConcealed = item.isSecret && !isUnlocked
              return (
                <Reveal
                  key={item.key}
                  from="zoom"
                  delay={index * 120}
                  className={cn(
                    "group hover:-translate-y-1 relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 transition hover:shadow-xl",
                    isUnlocked && "border-amber-400 ring-2 ring-amber-300/40",
                  )}
                >
                  <span
                    aria-hidden
                    className="-translate-x-full pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transition duration-1000 group-hover:translate-x-full dark:via-white/10"
                  />
                  <AchievementBadge
                    achievementKey={
                      isConcealed ? `hidden-${item.key}` : item.key
                    }
                    name={t(item.name.ja, item.name.en)}
                    tier={item.tier}
                    isHidden={isConcealed}
                    isUnlocked={isUnlocked || !isConcealed}
                    size={72}
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="font-bold">
                      {isUnlocked && item.isSecret
                        ? t("はじまりの仲間", "From the Very Beginning")
                        : t(item.name.ja, item.name.en)}
                    </div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      {isUnlocked && item.isSecret
                        ? t(
                            "2022年からの仲間に贈る実績です",
                            "For members who joined in 2022",
                          )
                        : t(item.how.ja, item.how.en)}
                    </div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs dark:text-emerald-400">
                        <CheckIcon className="size-3.5" />
                        {t("獲得済み", "Earned")}
                      </span>
                    ) : (
                      isConcealed && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <LockIcon className="size-3.5" />
                          {t("ひみつ", "Secret")}
                        </span>
                      )
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
          <div className="text-right">
            <Link to="/achievements" className="text-sm underline">
              {t("自分の実績を見る", "View my achievements")}
            </Link>
          </div>
        </section>

        {/* 記念作品 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<PartyPopperIcon className="size-6" />}
            title={t("記念作品ギャラリー", "Anniversary gallery")}
          />
          <div className="rounded-2xl border bg-gradient-to-r from-violet-50 to-pink-50 p-5 dark:from-violet-950/40 dark:to-pink-950/40">
            <p className="font-bold">
              {t(
                `「${TAG}」タグを付けて投稿すると、ここに並びます`,
                `Posts tagged "${TAG}" appear here`,
              )}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {t(
                "お祝いのイラスト、4年間の思い出、これからの創作など、どんな作品でも大歓迎です。期間中に投稿すると限定実績「4周年の記念作品」も手に入ります。",
                "Celebrations, memories of the past four years, or whatever you're making next — everything is welcome. Posting during the event also earns the limited achievement.",
              )}
            </p>
            <Link
              to={`/new/image?tag=${encodeURIComponent(TAG)}`}
              className="mt-3 inline-block"
            >
              <Button className="bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-white">
                <ImageIcon className="mr-2 size-4" />
                {t("記念作品を投稿する", "Post your artwork")}
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <GalleryTab
              isActive={galleryTab === "event"}
              onClick={() => setGalleryTab("event")}
              label={t("4周年記念祭", "Anniversary")}
              count={data.event?.worksCount ?? null}
            />
            <GalleryTab
              isActive={galleryTab === "prelude"}
              onClick={() => setGalleryTab("prelude")}
              label={t("前夜祭", "Prelude")}
              count={data.prelude?.worksCount ?? null}
            />
            <button
              type="button"
              aria-pressed={isR15Shown}
              onClick={() => setIsR15Shown((value) => !value)}
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition",
                isR15Shown
                  ? "border-amber-400 bg-amber-50 font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "hover:bg-muted",
              )}
            >
              {isR15Shown ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
              {isR15Shown
                ? t("R15を隠す", "Hide R15")
                : t("R15も表示する", "Show R15")}
            </button>
            {authContext.isLoggedIn && (
              <button
                type="button"
                aria-pressed={isAdultShown}
                onClick={() => setIsAdultShown((value) => !value)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition",
                  isAdultShown
                    ? "border-rose-400 bg-rose-50 font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "hover:bg-muted",
                )}
              >
                {isAdultShown ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
                {isAdultShown
                  ? t("R18・R18Gを隠す", "Hide R18 / R18G")
                  : t("R18・R18Gも表示する", "Show R18 / R18G")}
              </button>
            )}
          </div>
          {galleryTab === "event" &&
            (data.event?.works && data.event.works.length > 0 ? (
              <WorkGallery
                slug={SLUG}
                works={data.event.works}
                count={data.event.worksCount}
                page={data.page}
                ratings={galleryRatings}
              />
            ) : (
              <p className="py-12 text-center text-muted-foreground">
                {t(
                  "11月21日から作品が並びます。最初の1枚を投稿してみませんか？",
                  "Works will appear here from November 21. Be the first to post!",
                )}
              </p>
            ))}
          {galleryTab === "prelude" && data.prelude?.works && (
            <WorkGallery
              slug={PRELUDE_SLUG}
              works={data.prelude.works}
              count={data.prelude.worksCount}
              page={0}
              ratings={galleryRatings}
            />
          )}
        </section>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/events/aipictors-3rd-anniversary" className="underline">
            {t("3周年のページ", "3rd anniversary page")}
          </Link>
          <Link to="/events" className="underline">
            {t("イベント一覧", "All events")}
          </Link>
        </div>
      </div>

      {/* しめくくり */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-violet-950 via-fuchsia-900 to-pink-700 py-16 text-white md:py-24">
        <FallingConfetti count={24} />
        <div className="absolute inset-x-0 top-0 opacity-40">
          <WorkMarqueeRows
            works={ANNIVERSARY_4TH_WALL_WORKS.slice(72)}
            rows={1}
          />
        </div>
        <Reveal
          from="zoom"
          className="container relative mx-auto max-w-3xl space-y-6 px-4 pt-32 text-center md:pt-40"
        >
          <p className="animate-[anniv4-shine_4s_linear_infinite] bg-[length:200%_100%] bg-[linear-gradient(90deg,#fde047,#f9a8d4,#a5f3fc,#c4b5fd,#fde047)] bg-clip-text font-black text-5xl text-transparent motion-reduce:animate-none md:text-7xl">
            THANK YOU!
          </p>
          <p className="text-lg text-white/90 leading-relaxed md:text-xl">
            {t(
              "4年間、Aipictorsで描いて、見て、応援してくれたみなさんのおかげで、ここまで来ることができました。5年目も、みんなの「好き」がもっと届く場所にしていきます。これからもよろしくお願いします！",
              "We made it this far thanks to everyone who created, browsed and cheered on Aipictors over the past four years. In our fifth year we'll keep making this a place where what you love reaches more people. Thank you!",
            )}
          </p>
          <Link
            to={`/new/image?tag=${encodeURIComponent(TAG)}`}
            className="inline-block"
          >
            <Button
              size="lg"
              className="bg-white font-bold text-fuchsia-700 shadow-xl transition hover:scale-105 hover:bg-white/90"
            >
              <PartyPopperIcon className="mr-2 size-5" />
              {t("記念作品でお祝いする", "Celebrate with your artwork")}
            </Button>
          </Link>
        </Reveal>
      </section>
    </div>
  )
}

const STACK_COLORS = [
  "bg-fuchsia-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-400",
  "bg-emerald-500",
  "bg-rose-400",
]

function SectionTitle(props: {
  icon: React.ReactNode
  title: string
  note?: string
}) {
  return (
    <Reveal from="left" className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="flex items-center gap-2 font-black text-2xl md:text-4xl">
          <span className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 p-1.5 text-white shadow-fuchsia-500/30 shadow-md">
            {props.icon}
          </span>
          {props.title}
        </h2>
        {props.note && (
          <span className="text-muted-foreground text-xs">{props.note}</span>
        )}
      </div>
      <div className="h-1 w-24 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-transparent" />
    </Reveal>
  )
}

function ChartCard(props: {
  title: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <Reveal
      className={cn(
        "min-w-0 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg",
        props.className,
      )}
    >
      <h3 className="mb-4 font-bold text-sm">{props.title}</h3>
      {props.children}
    </Reveal>
  )
}

function TagCloud(props: {
  groups: {
    key: string
    label: string
    enLabel: string
    items: { name: string; count: number }[]
  }[]
  thumbnails: Record<string, { workId: string; thumbnail: string }>
}) {
  const t = useTranslation()
  const [selected, setSelected] = useState(props.groups[0]?.key ?? "")
  const group =
    props.groups.find((item) => item.key === selected) ?? props.groups[0]
  if (group === undefined) return null
  const max = Math.max(...group.items.map((item) => item.count), 1)
  // 画像のあるタグは上位 8 つまで大きなタイルにし、残りを文字の大きさで並べる
  const tiles = group.items
    .filter((item) => props.thumbnails[item.name])
    .slice(0, 8)
  const tileNames = new Set(tiles.map((item) => item.name))
  const rest = group.items.filter((item) => !tileNames.has(item.name))
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap gap-1.5">
        {props.groups.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSelected(item.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              item.key === group.key
                ? "border-transparent bg-gradient-to-r from-fuchsia-600 to-pink-500 font-bold text-white"
                : "hover:bg-muted",
            )}
          >
            {t(item.label, item.enLabel)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((item, index) => (
          <Link
            key={item.name}
            to={`/tags/${encodeURIComponent(item.name)}`}
            className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted"
          >
            <img
              src={props.thumbnails[item.name]?.thumbnail}
              alt={item.name}
              loading="lazy"
              className="size-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <span className="absolute top-1.5 left-1.5 rounded-full bg-black/50 px-2 py-0.5 font-bold text-white text-xs tabular-nums">
              {index + 1}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-2 text-white">
              <div className="truncate font-black text-base md:text-lg">
                #{item.name}
              </div>
              <div className="text-white/80 text-xs tabular-nums">
                {formatNumber(item.count)}
                {t(" 作品", " works")}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {rest.map((item) => {
          const ratio = item.count / max
          return (
            <Link
              key={item.name}
              to={`/tags/${encodeURIComponent(item.name)}`}
              className="rounded-md px-1 transition hover:bg-muted"
              style={{
                fontSize: `${0.8 + ratio * 1.3}rem`,
                fontWeight: ratio > 0.5 ? 800 : ratio > 0.2 ? 600 : 400,
              }}
              title={`${formatNumber(item.count)}`}
            >
              #{item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

type TopWork =
  (typeof ANNIVERSARY_4TH_STATS.yearlyTopWorks)[number]["works"][number]

/** 年のタブで切り替える人気作品（1 位を大きく、残りを並べる） */
function YearlyTopWorks(props: {
  groups: typeof ANNIVERSARY_4TH_STATS.yearlyTopWorks
  more: { year: number; works: Anniversary4thGalleryWork[] }[]
}) {
  const t = useTranslation()
  const [year, setYear] = useState(props.groups[0]?.year ?? 0)
  const group =
    props.groups.find((item) => item.year === year) ?? props.groups[0]
  if (group === undefined) return null
  const [first, ...others] = group.works
  const moreWorks =
    props.more.find((item) => item.year === group.year)?.works ?? []
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {props.groups.map((item) => (
          <button
            key={item.year}
            type="button"
            onClick={() => setYear(item.year)}
            className={cn(
              "rounded-full border px-4 py-1.5 font-bold text-sm transition",
              item.year === group.year
                ? "border-transparent bg-gradient-to-r from-violet-600 to-pink-500 text-white"
                : "hover:bg-muted",
            )}
          >
            {item.year}
          </button>
        ))}
      </div>
      <div
        key={group.year}
        className="grid animate-[anniv4-pop_0.6s_ease-out_both] gap-2 motion-reduce:animate-none md:grid-cols-4 md:grid-rows-2"
      >
        {first && (
          <WorkTile
            work={first}
            rank={1}
            className="aspect-square md:col-span-2 md:row-span-2"
            isLarge
          />
        )}
        <div className="grid grid-cols-2 gap-2 md:contents">
          {others.slice(0, 4).map((work, index) => (
            <WorkTile
              key={work.id}
              work={work}
              rank={index + 2}
              className="aspect-square"
            />
          ))}
        </div>
      </div>
      {others.length > 4 && (
        <div className="grid grid-cols-3 gap-2">
          {others.slice(4).map((work, index) => (
            <WorkTile
              key={work.id}
              work={work}
              rank={index + 6}
              className="aspect-[4/3]"
            />
          ))}
        </div>
      )}
      {moreWorks.length > 0 && (
        <div key={`more-${group.year}`} className="space-y-2 pt-4">
          <h3 className="font-bold text-sm">
            {t(
              `${group.year}年の人気作品をもっと見る`,
              `More popular works from ${group.year}`,
            )}
          </h3>
          <WorkMasonry works={moreWorks} />
        </div>
      )}
      <p className="text-muted-foreground text-xs">
        {t(
          "上位8作品のいいねの数は2026年11月20日時点、続きの作品は11月21日時点です。",
          "Like counts as of November 20, 2026 for the top 8, and November 21 for the rest.",
        )}
      </p>
    </div>
  )
}

function WorkTile(props: {
  work: TopWork
  rank: number
  className?: string
  isLarge?: boolean
}) {
  return (
    <Link
      to={`/posts/${props.work.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-muted",
        props.className,
      )}
    >
      <img
        src={props.isLarge ? props.work.largeThumbnail : props.work.thumbnail}
        alt={props.work.title}
        loading="lazy"
        className="size-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <span
        className={cn(
          "absolute top-2 left-2 rounded-full px-2 py-0.5 font-black text-xs",
          props.rank === 1
            ? "bg-amber-400 text-amber-950"
            : "bg-black/50 text-white",
        )}
      >
        {props.rank === 1 ? "👑 No.1" : `No.${props.rank}`}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-2 text-white">
        <div
          className={cn(
            "truncate font-bold",
            props.isLarge ? "text-lg" : "text-xs",
          )}
        >
          {props.work.title}
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-white/80">
          <span className="truncate">{props.work.userName}</span>
          <span className="flex shrink-0 items-center gap-0.5 tabular-nums">
            <HeartIcon className="size-3 fill-current" />
            {props.work.likes}
          </span>
        </div>
      </div>
    </Link>
  )
}

function GalleryTab(props: {
  isActive: boolean
  onClick: () => void
  label: string
  count: number | null
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition",
        props.isActive
          ? "border-transparent bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-white"
          : "hover:bg-muted",
      )}
    >
      {props.label}
      {props.count !== null && (
        <span className="ml-1 tabular-nums opacity-80">({props.count})</span>
      )}
    </button>
  )
}

function WorkGallery(props: {
  slug: string
  works: React.ComponentProps<typeof EventWorkList>["works"]
  count: number
  page: number
  ratings: IntrospectionEnum<"Rating">[]
}) {
  return (
    <EventWorkList
      eventSource="OFFICIAL"
      defaultRatings={props.ratings}
      works={props.works}
      maxCount={props.count}
      page={props.page}
      slug={props.slug}
      sort="DESC"
      orderBy="DATE_CREATED"
      sumWorksCount={0}
      workType={null}
      rating={null}
      onClickTitleSortButton={() => {}}
      onClickLikeSortButton={() => {}}
      onClickBookmarkSortButton={() => {}}
      onClickCommentSortButton={() => {}}
      onClickViewSortButton={() => {}}
      onClickAccessTypeSortButton={() => {}}
      onClickDateSortButton={() => {}}
      onClickWorkTypeSortButton={() => {}}
      onClickIsPromotionSortButton={() => {}}
      setWorkType={() => {}}
      setRating={() => {}}
      setSort={() => {}}
    />
  )
}

const appEventQuery = graphql(
  `query Anniversary4thEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    appEvent(slug: $slug) {
      id
      slug
      worksCount
      works(offset: $offset, limit: $limit, where: $where) {
        ...EventWorkListItem
      }
    }
  }`,
  [EventWorkListItemFragment],
)

const viewerAchievementsQuery = graphql(
  `query Anniversary4thViewerAchievements($userId: ID) {
    achievements(userId: $userId) {
      key
      isUnlocked
    }
  }`,
)
