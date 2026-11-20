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
  GlobeIcon,
  HashIcon,
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
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import {
  EventWorkList,
  EventWorkListItemFragment,
} from "~/routes/($lang).events.$event._index/components/event-work-list"
import { ANNIVERSARY_4TH_STATS } from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-stats"
import {
  formatNumber,
  MonthlyBars,
  ShareBarsTabs,
  StackedShare,
  WeekHourHeatmap,
} from "~/routes/($lang).events.aipictors-4th-anniversary/components/anniversary-charts"
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
    ratings: ["G", "R15"] as ("G" | "R15")[],
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

  const { data: achievementsData } = useQuery(viewerAchievementsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { userId: authContext.userId ?? null },
  })
  const unlockedKeys = new Set(
    (achievementsData?.achievements ?? [])
      .filter((item) => item.isUnlocked)
      .map((item) => item.key),
  )

  const lastYear = (value: number | null, current: number) =>
    value === null || value <= 0
      ? null
      : t(
          `去年から +${formatNumber(current - value)}`,
          `+${formatNumber(current - value)} since last year`,
        )

  return (
    <div className="min-h-screen">
      {/* ヒーロー */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 text-white">
        <Confetti />
        <div className="container relative mx-auto grid items-center gap-8 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 font-bold text-sm text-violet-700">
              <SparklesIcon className="size-4" />
              Aipictors 4th Anniversary
            </span>
            <h1 className="font-black text-5xl leading-tight drop-shadow md:text-7xl">
              4<span className="text-3xl md:text-5xl">{t("周年", "th")}</span>
              <br />
              {t("記念祭", "Anniversary")}
            </h1>
            <p className="font-bold text-xl md:text-2xl">2026.11.21 – 12.06</p>
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
                  className="bg-white font-bold text-fuchsia-700 hover:bg-white/90"
                >
                  <ImageIcon className="mr-2 size-5" />
                  {t("記念作品を投稿する", "Post your artwork")}
                </Button>
              </Link>
              <a href="#limited-achievements">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  <TrophyIcon className="mr-2 size-5" />
                  {t("限定実績を見る", "Limited achievements")}
                </Button>
              </a>
            </div>
          </div>
          <img
            src="/images/events/aipictors-4th-anniversary.webp"
            alt={t("Aipictors 4周年記念祭", "Aipictors 4th Anniversary")}
            width={1200}
            height={630}
            className="w-full rounded-2xl shadow-2xl ring-4 ring-white/30"
          />
        </div>
      </section>

      <div className="container mx-auto max-w-6xl space-y-16 px-4 py-12">
        {/* 大きな数字 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<BarChart3Icon className="size-6" />}
            title={t("4年間でつくったもの", "Four years in numbers")}
            note={t(
              `${stats.asOf.replaceAll("-", "/")} 時点`,
              `As of ${stats.asOf}`,
            )}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.totals.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="text-muted-foreground text-xs">
                  {t(item.label, item.enLabel)}
                </div>
                <div className="mt-1 bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text font-black text-transparent text-xl tabular-nums md:text-2xl lg:text-3xl">
                  {item.value >= 100_000_000
                    ? t(
                        `${(item.value / 100_000_000).toFixed(2)}億`,
                        `${Math.round(item.value / 1_000_000)}M`,
                      )
                    : formatNumber(item.value)}
                </div>
                {lastYear(item.lastYear, item.value) && (
                  <div className="mt-1 text-emerald-600 text-xs dark:text-emerald-400">
                    {lastYear(item.lastYear, item.value)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 月ごとの推移 */}
        <section className="space-y-4">
          <SectionTitle
            icon={<CalendarIcon className="size-6" />}
            title={t("4年間のあゆみ", "Month by month")}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title={t("投稿された作品（月ごと）", "Works posted per month")}
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
            <ChartCard
              title={t("新しく登録した人（月ごと）", "New members per month")}
            >
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
                  "生成機で作られた画像（月ごと・記録のある2025年7月から）",
                  "Images made with the generator per month (records since Jul 2025)",
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
                  <th className="px-4 py-2 text-right">{t("投稿", "Works")}</th>
                  <th className="px-4 py-2 text-right">
                    {t("新規登録", "New members")}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {t("生成", "Generations")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.yearly.map((item) => (
                  <tr key={item.year} className="border-t">
                    <td className="px-4 py-2 font-bold">{item.year}</td>
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
                "生成の数は、記録が残っている2025年7月からの分です。2026年は11月20日まで（11月は予約投稿を含みます）。",
                "Generation counts only cover records kept since July 2025. 2026 is through November 20 (November includes scheduled posts).",
              )}
            </p>
          </div>
        </section>

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
            <TagCloud groups={stats.tags} />
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.facts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border bg-gradient-to-br from-fuchsia-50 to-violet-50 p-4 dark:from-fuchsia-950/40 dark:to-violet-950/40"
                >
                  <div className="text-muted-foreground text-xs">
                    {t(item.label, item.enLabel)}
                  </div>
                  <div className="mt-1 font-bold text-xl">
                    {t(item.value, item.enValue ?? item.value)}
                  </div>
                </div>
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
            {LIMITED_ACHIEVEMENTS.map((item) => {
              const isUnlocked = unlockedKeys.has(item.key)
              const isConcealed = item.isSecret && !isUnlocked
              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border bg-card p-4",
                    isUnlocked && "border-amber-400 ring-2 ring-amber-300/40",
                  )}
                >
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
                </div>
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
          <div className="flex gap-2">
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
          </div>
          {galleryTab === "event" &&
            (data.event?.works && data.event.works.length > 0 ? (
              <WorkGallery
                slug={SLUG}
                works={data.event.works}
                count={data.event.worksCount}
                page={data.page}
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
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="flex items-center gap-2 font-black text-2xl md:text-3xl">
        <span className="text-fuchsia-500">{props.icon}</span>
        {props.title}
      </h2>
      {props.note && (
        <span className="text-muted-foreground text-xs">{props.note}</span>
      )}
    </div>
  )
}

function ChartCard(props: {
  title: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn("min-w-0 rounded-2xl border bg-card p-5", props.className)}
    >
      <h3 className="mb-4 font-bold text-sm">{props.title}</h3>
      {props.children}
    </div>
  )
}

function TagCloud(props: {
  groups: {
    key: string
    label: string
    enLabel: string
    items: { name: string; count: number }[]
  }[]
}) {
  const t = useTranslation()
  const [selected, setSelected] = useState(props.groups[0]?.key ?? "")
  const group =
    props.groups.find((item) => item.key === selected) ?? props.groups[0]
  if (group === undefined) return null
  const max = Math.max(...group.items.map((item) => item.count), 1)
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
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {group.items.map((item) => {
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
}) {
  return (
    <EventWorkList
      eventSource="OFFICIAL"
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

/** ヒーローの紙吹雪（CSS だけ） */
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, index) => index)
  const colors = ["#fde047", "#a5f3fc", "#f9a8d4", "#bbf7d0", "#fff", "#c4b5fd"]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {pieces.map((index) => (
        <span
          key={index}
          className="absolute h-3 w-1.5 rounded-sm opacity-80"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 53) % 100}%`,
            backgroundColor: colors[index % colors.length],
            transform: `rotate(${(index * 47) % 180}deg)`,
          }}
        />
      ))}
    </div>
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
