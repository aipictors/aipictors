import { useLocation } from "@remix-run/react"
import type { ResultOf } from "gql.tada"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AdSlot } from "~/components/ads/ad-slot"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import {
  GenreWorkCard,
  type GenreWorkCardFragment,
} from "~/components/genre-works/genre-work-card"
import { PictorChanHint } from "~/components/works-index/pictor-chan-hint"
import { WorksIndexPagination } from "~/components/works-index/works-index-pagination"
import {
  toWorksIndexSearch,
  WORKS_INDEX_PER_PAGE,
} from "~/components/works-index/works-index-params"
import { WorksIndexSortTabs } from "~/components/works-index/works-index-sort-tabs"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { getPathLocale } from "~/utils/locale-path"
import { toResizedImageUrl } from "~/utils/resized-image-url"

const POSTS_INDEX_SORTS = ["new", "week", "popular"] as const

export type PostsIndexSort = (typeof POSTS_INDEX_SORTS)[number]

export const isPostsIndexSort = (
  value: string | null,
): value is PostsIndexSort =>
  (POSTS_INDEX_SORTS as readonly (string | null)[]).includes(value)

type CoverKey = "2d" | "2.5d" | "3d" | "novel" | "column"

type Props = {
  data: {
    works: ResultOf<typeof GenreWorkCardFragment>[]
    page: number
    lastPage: number
    sort: PostsIndexSort
    /** ジャンルの入口（1 ページ目だけ） */
    entries: {
      covers: Record<CoverKey, string | null>
      novelsCount: number
      columnsCount: number
    } | null
    seed: number
  }
}

const SORT_LABELS: Record<PostsIndexSort, readonly [string, string]> = {
  new: ["新着", "Latest"],
  week: ["今週の人気", "This week"],
  popular: ["歴代の人気", "All time"],
}

const LIST_TITLES: Record<PostsIndexSort, readonly [string, string]> = {
  new: ["新着の作品", "Latest works"],
  week: ["今週の人気作品", "Most liked this week"],
  popular: ["歴代の人気作品", "Most liked of all time"],
}

const HINTS = [
  [
    "迷ったら、今週の人気作品から見てみましょう！",
    "Not sure where to start? Try this week's favorites!",
  ],
  [
    "プロンプトが公開されている作品は、生成のヒントになりますよ！",
    "Works with shared prompts make great hints for your own!",
  ],
  [
    "いいなと思ったら、いいねで作者さんを応援しましょう！",
    "Found one you like? Cheer on the creator with a like!",
  ],
] as const

/** 作品を探す別の入口 */
const EXPLORE_LINKS = [
  { path: "/rankings", label: ["ランキング", "Rankings"] },
  { path: "/tags", label: ["タグ", "Tags"] },
  { path: "/themes", label: ["お題", "Themes"] },
  { path: "/archive", label: ["過去の名作", "Past masterpieces"] },
  { path: "/albums", label: ["シリーズ", "Series"] },
  { path: "/search", label: ["検索", "Search"] },
] as const

/**
 * すべての作品の入口（/posts）
 * ジャンルと読みものへの入口を先に見せて、下に作品の一覧を続ける。
 * 並び替えとページ送りは URL で表すので、サーバーで HTML を描ける
 */
export function PostsIndexView(props: Props) {
  const t = useTranslation()
  const location = useLocation()
  const { data } = props

  const isEnglish = getPathLocale(location.pathname) === "en"
  const localePrefix = isEnglish ? "/en" : ""
  const toPath = (path: string) => `${localePrefix}${path}`

  const sortParam = data.sort === "new" ? null : data.sort
  const toHref = (page: number) =>
    `${toPath("/posts")}${toWorksIndexSearch({ sort: sortParam, page })}`

  const novelsCount = data.entries?.novelsCount ?? 0
  const columnsCount = data.entries?.columnsCount ?? 0

  const entries: {
    key: CoverKey
    path: string
    label: readonly [string, string]
    caption: readonly [string, string]
  }[] = [
    {
      key: "2d",
      path: "/posts/2d",
      label: ["2D", "2D"],
      caption: ["イラスト・アニメ調", "Illustration & anime"],
    },
    {
      key: "2.5d",
      path: "/posts/2.5d",
      label: ["2.5D", "2.5D"],
      caption: ["セミリアル", "Semi-realistic"],
    },
    {
      key: "3d",
      path: "/posts/3d",
      label: ["3D", "3D"],
      caption: ["フォト・実写風", "Photo-realistic"],
    },
    {
      key: "novel",
      path: "/novels",
      label: ["小説", "Novels"],
      caption: [
        `${novelsCount.toLocaleString()}作品`,
        `${novelsCount.toLocaleString()} works`,
      ],
    },
    {
      key: "column",
      path: "/notes",
      label: ["コラム", "Columns"],
      caption: [
        `${columnsCount.toLocaleString()}作品`,
        `${columnsCount.toLocaleString()} works`,
      ],
    },
  ]

  const homeUrl = `${config.siteURL}${localePrefix}`
  const pageUrl = `${homeUrl}/posts`

  const collectionPage: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("すべての作品", "All works"),
    description: t(
      "Aipictorsに投稿されたAIイラスト・AIフォト・AI動画・AI小説の一覧です。",
      "AI illustrations, photos, videos, and novels posted on Aipictors.",
    ),
    url: pageUrl,
    inLanguage: isEnglish ? "en" : "ja",
    isPartOf: { "@type": "WebSite", name: "Aipictors", url: `${homeUrl}/` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.works.map((work, index) => ({
        "@type": "ListItem",
        position: data.page * WORKS_INDEX_PER_PAGE + index + 1,
        name: t.workTitle(work.title, work.enTitle),
        url: `${homeUrl}/posts/${work.id}`,
      })),
    },
  }

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Aipictors",
        item: `${homeUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("すべての作品", "All works"),
        item: pageUrl,
      },
    ],
  }

  const isFirstPage = data.page === 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-16 md:space-y-6">
      <AppJsonLdScript jsonLd={[collectionPage, breadcrumb]} />

      <header className="space-y-2">
        <h1 className="font-black text-xl md:text-2xl">
          {t("すべての作品", "All works")}
          {!isFirstPage && (
            <span className="ml-2 font-medium text-muted-foreground text-sm">
              {t(`${data.page + 1}ページ目`, `Page ${data.page + 1}`)}
            </span>
          )}
        </h1>
        {isFirstPage && (
          <>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                "AIイラスト・AIフォト・AI動画・AI小説が集まっています。ジャンルから入るか、下の一覧から眺めてみてください。",
                "AI illustrations, photos, videos, and novels, all in one place. Start from a genre or browse the list below.",
              )}
            </p>
            <PictorChanHint lines={HINTS} seed={data.seed} />
          </>
        )}
      </header>

      {data.entries !== null && (
        <section aria-label={t("ジャンル", "Genres")} className="space-y-3">
          <ul className="-mx-3 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {entries.map((entry, index) => {
              const imageUrl = data.entries?.covers[entry.key]
              return (
                <li
                  key={entry.key}
                  className="w-32 shrink-0 snap-start md:w-auto"
                >
                  <Link
                    to={toPath(entry.path)}
                    className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-muted"
                  >
                    {imageUrl && (
                      <img
                        src={toResizedImageUrl(imageUrl, 320) ?? imageUrl}
                        alt=""
                        width={320}
                        height={240}
                        decoding="async"
                        loading={index < 3 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-2 md:p-2.5">
                      <span className="block font-bold text-sm text-white drop-shadow md:text-base">
                        {t(entry.label[0], entry.label[1])}
                      </span>
                      <span className="block truncate text-[11px] text-white/85">
                        {t(entry.caption[0], entry.caption[1])}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <nav
            aria-label={t("作品を探す", "Explore works")}
            className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {EXPLORE_LINKS.map((item) => (
              <Link
                key={item.path}
                to={toPath(item.path)}
                className="shrink-0 rounded-full border bg-card px-3.5 py-1.5 font-medium text-sm transition hover:bg-muted active:scale-95"
              >
                {t(item.label[0], item.label[1])}
              </Link>
            ))}
          </nav>
        </section>
      )}

      <section aria-labelledby="posts-list-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="posts-list-heading" className="font-bold text-lg md:text-xl">
            {t(LIST_TITLES[data.sort][0], LIST_TITLES[data.sort][1])}
          </h2>
          <WorksIndexSortTabs
            label={t("並び順", "Sort")}
            current={data.sort}
            items={POSTS_INDEX_SORTS.map((value) => ({
              value,
              label: SORT_LABELS[value],
              href: `${toPath("/posts")}${toWorksIndexSearch({
                sort: value === "new" ? null : value,
              })}`,
            }))}
          />
        </div>

        {data.works.length === 0 ? (
          <div className="flex justify-center rounded-xl border border-dashed px-4 py-10">
            <PictorChanHint
              lines={[
                [
                  "いまは作品が見つかりませんでした…。少し待ってからまた来てくださいね！",
                  "No works here right now... Please come back in a little while!",
                ],
              ]}
            />
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {data.works.map((work) => (
              <li key={work.id} className="min-w-0">
                <GenreWorkCard
                  work={work}
                  to={toPath(`/posts/${work.id}`)}
                  userTo={toPath(`/users/${work.user?.id}`)}
                  aspectClassName="aspect-[3/4]"
                  sizes="(min-width: 1280px) 180px, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                />
              </li>
            ))}
          </ul>
        )}

        {/* この一覧は全年齢の作品だけ */}
        <AdSlot
          slot={config.googleAdsense.slots.list}
          enabled={data.works.length > 0}
          minHeight={280}
        />

        <WorksIndexPagination
          page={data.page}
          lastPage={data.lastPage}
          toHref={toHref}
        />
      </section>
    </div>
  )
}
