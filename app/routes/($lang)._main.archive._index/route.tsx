import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ShuffleIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import {
  ARCHIVE_SEASONS,
  type ArchivePeriod,
  type ArchiveSeason,
  limitWorksPerUser,
  parseArchivePeriod,
  shuffleWorks,
  toArchiveDateRanges,
  toArchiveYears,
  toJstDateText,
} from "~/routes/($lang)._main.archive._index/utils/archive-picks"
import { createMeta } from "~/utils/create-meta"

/** 1 回に紹介する数 */
const SHOW_COUNT = 24

/** いいねの多い順に、1 つの期間から読む数（この中から毎日選び直す） */
const PAGE_SIZE = 64

const PICTOR_CHAN_ICON_URL = "https://assets.aipictors.com/pictorchanicon.webp"

const SEASON_LABELS: Record<ArchiveSeason, [string, string]> = {
  spring: ["春", "Spring"],
  summer: ["夏", "Summer"],
  autumn: ["秋", "Autumn"],
  winter: ["冬", "Winter"],
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.ARCHIVE, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export async function loader(props: LoaderFunctionArgs) {
  const now = new Date()
  const period = parseArchivePeriod(
    new URL(props.request.url).searchParams,
    now,
  )

  const ranges = toArchiveDateRanges(period, now)
  // 1 つの期間だけのときは 2 ページ分読む（人気の作者に偏っても数が残るように）
  const offsets = ranges.length === 1 ? [0, PAGE_SIZE] : [0]
  const results = await Promise.all(
    ranges.flatMap((range) =>
      offsets.map((offset) =>
        loaderClient.query({
          query: archiveWorksQuery,
          variables: {
            offset,
            limit: PAGE_SIZE,
            where: {
              ratings: ["G", "R15"],
              orderBy: "LIKES_COUNT",
              sort: "DESC",
              workType: "WORK",
              beforeCreatedAt: range.before,
              ...(range.after ? { createdAtAfter: range.after } : {}),
            },
          },
        }),
      ),
    ),
  )

  const works = limitWorksPerUser(
    results
      .flatMap((result) => result.data.works)
      .sort((a, b) => b.likesCount - a.likesCount),
  )

  return {
    period,
    works,
    years: toArchiveYears(now),
    /** 同じ日は同じ並び（毎日入れ替わる） */
    dateText: toJstDateText(now),
  }
}

/**
 * 過去の名作（年・季節・殿堂から、ぴくたーちゃんが毎日選び直して紹介する）
 */
export default function ArchivePage() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const [searchParams] = useSearchParams()

  const [shuffleCount, setShuffleCount] = useState(0)

  // 期間を変えたら今日の並びに戻す
  useEffect(() => {
    setShuffleCount(0)
  }, [searchParams.toString()])

  const works = useMemo(
    () =>
      shuffleWorks(
        data.works,
        `${data.dateText}:${searchParams.toString()}:${shuffleCount}`,
      ).slice(0, SHOW_COUNT),
    [data.works, data.dateText, searchParams.toString(), shuffleCount],
  )

  const toUrl = (next: ArchivePeriod) => {
    const params = new URLSearchParams()
    if (next.year !== null) params.set("year", String(next.year))
    if (next.season !== null) params.set("season", next.season)
    const query = params.toString()
    return query === "" ? "/archive" : `/archive?${query}`
  }

  const { year, season } = data.period
  const seasonLabel = season === null ? null : SEASON_LABELS[season]

  const heading =
    year === null && seasonLabel === null
      ? t("殿堂", "Hall of Fame")
      : year === null && seasonLabel !== null
        ? t(`歴代の${seasonLabel[0]}`, `${seasonLabel[1]} of every year`)
        : t(
            `${year}年${seasonLabel ? `の${seasonLabel[0]}` : ""}`,
            `${seasonLabel ? `${seasonLabel[1]} ` : ""}${year}`,
          )

  const chipClassName = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3.5 py-1.5 font-bold text-sm transition active:scale-95",
      isActive
        ? "border-foreground bg-foreground text-background"
        : "bg-card hover:bg-muted",
    )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-16">
      <header className="flex items-start gap-3 rounded-2xl border bg-card p-4 md:p-5">
        <img
          src={PICTOR_CHAN_ICON_URL}
          alt={t("ぴくたーちゃん", "Pictor-chan")}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full"
        />
        <div className="min-w-0 space-y-1">
          <h1 className="font-black text-xl md:text-2xl">
            {t("過去の名作", "Past Masterpieces")}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              "ぴくたーちゃんが、埋もれてしまった作品を毎日選び直してご紹介します！いいねの多かった作品から、公開して30日以上たったものを選んでいます。",
              "Pictor-chan picks works from the past every day, chosen from well-liked works posted at least 30 days ago.",
            )}
          </p>
        </div>
      </header>

      <nav aria-label={t("期間", "Period")} className="space-y-2">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Link
            to={toUrl({ year: null, season })}
            className={chipClassName(year === null)}
            aria-current={year === null ? "page" : undefined}
          >
            {season === null
              ? t("殿堂", "Hall of Fame")
              : t("全年", "All years")}
          </Link>
          {data.years.map((item) => (
            <Link
              key={item}
              to={toUrl({ year: item, season })}
              className={chipClassName(year === item)}
              aria-current={year === item ? "page" : undefined}
            >
              {t(`${item}年`, String(item))}
            </Link>
          ))}
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Link
            to={toUrl({ year, season: null })}
            className={chipClassName(season === null)}
            aria-current={season === null ? "page" : undefined}
          >
            {t("通年", "All seasons")}
          </Link>
          {ARCHIVE_SEASONS.map((item) => (
            <Link
              key={item}
              to={toUrl({ year, season: item })}
              className={chipClassName(season === item)}
              aria-current={season === item ? "page" : undefined}
            >
              {t(...SEASON_LABELS[item])}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-lg">{heading}</h2>
        {data.works.length > SHOW_COUNT && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShuffleCount((count) => count + 1)}
          >
            <ShuffleIcon className="mr-1.5 size-4" />
            {t("別の作品を見る", "Show others")}
          </Button>
        )}
      </div>

      {works.length === 0 ? (
        <p className="rounded-2xl border bg-muted/20 px-4 py-12 text-center text-muted-foreground text-sm">
          {t(
            "この期間の作品はまだありません。",
            "There are no works from this period yet.",
          )}
        </p>
      ) : (
        <ResponsivePhotoWorksAlbum
          works={works}
          size="large"
          isShowProfile={true}
          priorityCount={4}
        />
      )}
    </div>
  )
}

const archiveWorksQuery = graphql(
  `query ArchiveWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
