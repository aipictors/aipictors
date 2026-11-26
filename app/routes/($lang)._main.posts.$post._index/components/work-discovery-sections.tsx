import { ChevronRightIcon } from "lucide-react"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import type { WorkDiscovery } from "~/routes/($lang)._main.posts.$post._index/utils/work-discovery"

/**
 * 作品ページの下に並べる「おすすめ（同じタグ）」「前日ランキング」「同じお題の作品」。
 * 作品ページの loader で取り（utils/work-discovery.server.ts）、最初の HTML に入れる（検索エンジンが作品同士のリンクを
 * たどれるように。以前はブラウザで画面に近づいてから読み、HTML に入る作品へのリンクは 15 件ほどだった）
 */

function SectionHeader(props: { title: string; to?: string }) {
  const t = useTranslation()
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="truncate font-bold text-base">{props.title}</h2>
      {props.to && (
        <Link
          to={props.to}
          className="flex shrink-0 items-center text-muted-foreground text-sm hover:text-foreground"
        >
          {t("すべて見る", "See all")}
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  )
}

/**
 * おすすめ → 前日ランキング → 同じお題の作品（ちちぷいの作品ページの下と同じく、作品を一覧で並べる）
 */
export function WorkDiscoverySections(props: {
  discovery: WorkDiscovery
  isSensitive?: boolean
}) {
  const t = useTranslation()
  const { discovery } = props
  const pathPrefix = props.isSensitive ? "/r" : ""
  const awardRanks = new Map(
    discovery.awardWorks.map((work, index) => [work.id.toString(), index + 1]),
  )

  return (
    <>
      {discovery.tagWorks.length > 0 && (
        <section className="space-y-3 border-t pt-6">
          <SectionHeader
            title={
              discovery.tagName
                ? t(
                    `#${discovery.tagName} のおすすめ`,
                    `More #${discovery.tagName}`,
                  )
                : t("新着作品", "New works")
            }
            to={
              discovery.tagName
                ? `${pathPrefix}/tags/${encodeURIComponent(discovery.tagName)}`
                : `${pathPrefix}/posts`
            }
          />
          <ResponsivePhotoWorksAlbum
            works={discovery.tagWorks}
            layout="square"
            isShowProfile
            fillRows
          />
        </section>
      )}
      {discovery.awardWorks.length > 0 && discovery.awardDate && (
        <section className="space-y-3 border-t pt-6">
          <SectionHeader
            title={t(
              `デイリーランキング（${discovery.awardDate.month}/${discovery.awardDate.day}）`,
              `Daily ranking (${discovery.awardDate.month}/${discovery.awardDate.day})`,
            )}
            // R18 の日別ランキングのページはないので、全年齢のときだけ
            to={
              props.isSensitive
                ? undefined
                : `/rankings/${discovery.awardDate.year}/${discovery.awardDate.month}/${discovery.awardDate.day}`
            }
          />
          <ResponsivePhotoWorksAlbum
            works={discovery.awardWorks}
            layout="square"
            isShowProfile
            fillRows
            renderItemOverlay={(workId) => {
              const rank = awardRanks.get(workId)
              return rank ? (
                <span className="pointer-events-none absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 font-bold text-foreground text-xs backdrop-blur-sm">
                  {rank}
                </span>
              ) : null
            }}
          />
        </section>
      )}
      {discovery.theme && discovery.themeWorks.length > 0 && (
        <section className="space-y-3 border-t pt-6">
          <SectionHeader
            title={t(
              `お題「${discovery.theme.title}」の作品`,
              `Theme: ${discovery.theme.title}`,
            )}
            to={`/themes/${discovery.theme.dateText.replace(/-/g, "/")}`}
          />
          <ResponsivePhotoWorksAlbum
            works={discovery.themeWorks}
            layout="square"
            isShowProfile
            fillRows
          />
        </section>
      )}
    </>
  )
}
