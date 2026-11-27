import { HeartIcon, LightbulbIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { LikeButton } from "~/components/like-button"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { useViewerRatings } from "~/hooks/use-viewer-ratings"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import type {
  HomeTagWorksResponse,
  HomeTagWorksRow,
} from "~/routes/api.home-tag-works/route"
import {
  type GridColumnBreakpoint,
  incompleteRowHiddenClassName,
} from "~/utils/grid-layout"
import { getJstDate } from "~/utils/jst-date"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import { filterWorksByRatings } from "~/utils/viewer-ratings"

/** 作品を折り返して並べる（ちちぷいのトップと同じく、横にスクロールさせず何段も見せる。PC は 6 列） */
const gridClassName =
  "grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 lg:grid-cols-6 md:gap-x-2.5"

/** 上の列数（3 / sm:4 / lg:6）。最後の段が埋まらない作品をその幅でだけ隠す */
/** 一覧を出す最少の作品数（PC の 1 段） */
const SHELF_MIN_WORKS = 6

const SHELF_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 3, hiddenClassName: "max-sm:hidden" },
  { columns: 4, hiddenClassName: "sm:max-lg:hidden" },
  { columns: 6, hiddenClassName: "lg:hidden" },
]

/**
 * タグごとの作品（今日のお題と人気タグを、タグごとに 2 段の一覧で並べる）
 *
 * initialRows があれば（トップの loader で取った分）それを最初の HTML から出す。
 * なければ HomeDeferredSection の中に置き、画面に近づいてから /api/home-tag-works（拠点のキャッシュ）を読む
 */
export function HomeTagWorksSection(props: {
  /** R18 のトップ（R18 の作品を出し、リンクを /r に） */
  isSensitive?: boolean
  initialRows?: HomeTagWorksRow[]
}) {
  const hasInitialRows = (props.initialRows?.length ?? 0) > 0
  const [rows, setRows] = useState<HomeTagWorksRow[] | null>(
    hasInitialRows ? (props.initialRows ?? null) : null,
  )

  useEffect(() => {
    if (hasInitialRows) return
    let isActive = true
    fetch(`/api/home-tag-works${props.isSensitive ? "?sensitive=1" : ""}`)
      .then((response) => (response.ok ? response.json() : { rows: [] }))
      .then((body: HomeTagWorksResponse) => {
        if (isActive) setRows(Array.isArray(body.rows) ? body.rows : [])
      })
      .catch(() => {
        if (isActive) setRows([])
      })
    return () => {
      isActive = false
    }
  }, [props.isSensitive, hasInitialRows])

  if (rows === null) return <HomeTagWorksPlaceholder />
  if (rows.length === 0) return null

  return (
    <section className="space-y-6">
      {rows.map((row) => (
        <HomeTagWorksRowView
          key={row.tag}
          row={row}
          isSensitive={props.isSensitive}
        />
      ))}
    </section>
  )
}

function HomeTagWorksRowView(props: {
  row: HomeTagWorksRow
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const { row } = props
  const label = t.tag(row.tag, row.enTag) ?? row.tag
  const today = getJstDate()
  const prefix = props.isSensitive ? "/r" : ""
  const link = row.isTheme
    ? `${prefix}/themes/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`
    : `${prefix}/tags/${encodeURIComponent(row.tag)}`
  return (
    <HomeWorksShelf
      title={
        row.isTheme
          ? t(`今日のお題「${label}」`, `Today's theme: ${label}`)
          : `#${label}`
      }
      link={link}
      works={row.works}
      isSensitive={props.isSensitive}
    />
  )
}

/**
 * 見出しと作品の一覧（いま人気・タグごとの作品・デイリーランキングで共通）。showRank で左上に順位を出す
 */
export function HomeWorksShelf(props: {
  title: string
  link: string
  works: HomeTagWorksRow["works"]
  showRank?: boolean
  /** 見出しの下の短い説明 */
  description?: string
  /** 画像を読む幅（大きく見せる欄は広めに） */
  imageWidth?: number
  /** R18 の作品（作品ページを /r に） */
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const viewerRatings = useViewerRatings()
  // 一覧はサーバーで「全年齢と R15」で取ってキャッシュしているので、R15 を出さない設定の人には R15 を外す
  const works = props.isSensitive
    ? props.works
    : filterWorksByRatings(props.works, viewerRatings.normalRatings)
  // PC の 1 段（6 列）に満たない一覧は、右に穴が空くので出さない
  if (works.length < SHELF_MIN_WORKS) return null
  return (
    <div className="space-y-2.5">
      <HomeSectionHeading
        title={props.title}
        description={props.description}
        link={props.link}
        linkLabel={t("すべて見る", "See all")}
      />
      <ul className={gridClassName}>
        {works.map((work, index) => {
          const title = t.workTitle(work.title, work.enTitle)
          return (
            // どの画面幅でも最後の段に穴を空けない（埋まらない分はその幅でだけ隠す）
            <li
              key={work.id}
              className={cn(
                "min-w-0",
                incompleteRowHiddenClassName(
                  index,
                  works.length,
                  SHELF_BREAKPOINTS,
                ),
              )}
            >
              <div className="relative">
                <Link
                  to={`${props.isSensitive ? "/r" : ""}/posts/${work.id}`}
                  className="group block space-y-1.5"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                    <img
                      src={
                        toResizedImageUrl(
                          work.smallThumbnailImageURL,
                          props.imageWidth ?? 240,
                        ) ?? work.smallThumbnailImageURL
                      }
                      alt={title}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                    {props.showRank && (
                      <span
                        className={cn(
                          "absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full font-bold text-white text-xs tabular-nums",
                          index === 0
                            ? "bg-amber-500"
                            : index === 1
                              ? "bg-slate-400"
                              : index === 2
                                ? "bg-orange-700"
                                : "bg-black/60",
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                    <span className="absolute right-1.5 bottom-1.5 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 font-bold text-[11px] text-white tabular-nums">
                      <HeartIcon className="size-3 fill-pink-500 text-pink-500" />
                      {work.likesCount}
                    </span>
                  </div>
                  <p className="line-clamp-1 font-medium text-xs">{title}</p>
                </Link>
                {/* 一覧からそのままいいね（他の欄と同じ部品。リンクの外に置いて作品ページへ移らないように） */}
                <div className="absolute top-0.5 right-0.5">
                  <LikeButton
                    size={40}
                    targetWorkId={work.id}
                    targetWorkOwnerUserId={work.user?.id ?? ""}
                    defaultLikedCount={work.likesCount}
                    isBackgroundNone={true}
                    strokeWidth={2}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function HomeTagWorksPlaceholder() {
  const t = useTranslation()
  return (
    <section className="space-y-2.5" aria-busy="true">
      <p className="flex items-center gap-1.5 font-bold text-lg">
        <LightbulbIcon className="size-5 text-muted-foreground" />
        {t("タグごとの作品", "Works by tag")}
      </p>
      <div className={gridClassName}>
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton
            key={index.toString()}
            className="aspect-square rounded-xl"
          />
        ))}
      </div>
    </section>
  )
}
