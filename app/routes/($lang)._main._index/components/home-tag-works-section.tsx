import { HeartIcon, LightbulbIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Skeleton } from "~/components/ui/skeleton"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type {
  HomeTagWorksResponse,
  HomeTagWorksRow,
} from "~/routes/api.home-tag-works/route"
import { HomeSectionHeading } from "~/routes/($lang)._main._index/components/home-section-heading"
import { getJstDate } from "~/utils/jst-date"
import { toResizedImageUrl } from "~/utils/resized-image-url"

const rowClassName =
  "-mx-4 flex snap-x gap-2.5 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"

/**
 * タグごとの作品（今日のお題と人気タグ 3 つを、タグごとに横に並べる）
 *
 * HomeDeferredSection の中に置き、画面に近づいてから /api/home-tag-works（拠点のキャッシュ）を読む。
 * 最初の HTML には入れない
 */
export function HomeTagWorksSection(props: {
  /** R18 のトップ（R18 の作品を出し、リンクを /r に） */
  isSensitive?: boolean
}) {
  const [rows, setRows] = useState<HomeTagWorksRow[] | null>(null)

  useEffect(() => {
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
  }, [props.isSensitive])

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
    <div className="space-y-2.5">
      <HomeSectionHeading
        title={
          row.isTheme
            ? t(`今日のお題「${label}」`, `Today's theme: ${label}`)
            : `#${label}`
        }
        link={link}
      />
      <ul className={rowClassName}>
        {row.works.map((work) => {
          const title = t.workTitle(work.title, work.enTitle)
          return (
            <li
              key={work.id}
              className="w-[38%] shrink-0 snap-start sm:w-[26%] md:w-[19%] xl:w-[15.5%]"
            >
              <Link
                to={`/posts/${work.id}`}
                className="group block space-y-1.5"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img
                    src={
                      toResizedImageUrl(work.smallThumbnailImageURL, 240) ??
                      work.smallThumbnailImageURL
                    }
                    alt={title}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <span className="absolute right-1.5 bottom-1.5 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 font-bold text-[11px] text-white tabular-nums">
                    <HeartIcon className="size-3 fill-pink-500 text-pink-500" />
                    {work.likesCount}
                  </span>
                </div>
                <p className="line-clamp-1 font-medium text-xs">{title}</p>
              </Link>
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
      <div className={rowClassName}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton
            key={index.toString()}
            className="aspect-square w-[38%] shrink-0 rounded-xl sm:w-[26%] md:w-[19%] xl:w-[15.5%]"
          />
        ))}
      </div>
    </section>
  )
}
