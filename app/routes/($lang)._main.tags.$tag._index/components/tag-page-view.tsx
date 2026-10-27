import { useQuery } from "@apollo/client/index"
import { Link, useFetcher, useLocation } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  ChevronRightIcon,
  HashIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { TagFollowButton } from "~/components/button/tag-follow-button"
import { LinkPagination } from "~/components/link-pagination"
import { ResponsivePhotoWorksAlbum } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { TagActionOther } from "~/routes/($lang)._main.tags._index/components/tag-action-other"
import type { loader } from "~/routes/($lang)._main.tags.$tag._index/route"
import {
  TAG_PAGE_MAX_PAGE,
  TAG_PAGE_SIZE,
  type TagPageOrderBy,
  type TagPageQuery,
  type TagPageRating,
  toTagPageSearch,
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"
import { getPathLocale } from "~/utils/locale-path"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type LoaderData = Awaited<ReturnType<typeof loader>>

type Props = LoaderData

const viewerFollowedTagsQuery = graphql(
  `query TagPageViewerFollowedTags($offset: Int!, $limit: Int!) {
    viewer {
      id
      followingTags(offset: $offset, limit: $limit) {
        id
        name
      }
    }
  }`,
)

function Chip(props: {
  to: string
  isActive?: boolean
  children: React.ReactNode
  className?: string
  replace?: boolean
}) {
  return (
    <Link
      to={props.to}
      preventScrollReset
      replace={props.replace}
      aria-current={props.isActive ? "true" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 font-medium text-sm transition-colors",
        props.isActive
          ? "border-foreground bg-foreground text-background"
          : "bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
        props.className,
      )}
    >
      {props.children}
    </Link>
  )
}

/**
 * タグページ（/tags/:tag）
 * 並び順・絞り込み・ページは URL で持ち、サーバーで描画する（共有・検索エンジンのため）
 */
export function TagPageView(props: Props) {
  const t = useTranslation()
  const location = useLocation()
  const authContext = useContext(AuthContext)
  const locale = getPathLocale(location.pathname)
  const basePath = location.pathname

  const { query } = props

  // 「もっと見る」で読み込んだ続きのページ
  const fetcher = useFetcher<LoaderData>()
  const [extraWorks, setExtraWorks] = useState<LoaderData["works"]>([])
  const [loadedPage, setLoadedPage] = useState(query.page)

  // URL（並び順・絞り込み・ページ）が変わったら追加分をリセット
  useEffect(() => {
    setExtraWorks([])
    setLoadedPage(query.page)
  }, [props.works, query.page])

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return
    const nextWorks = fetcher.data.works
    const page = fetcher.data.query.page
    setExtraWorks((current) => {
      const ids = new Set([
        ...props.works.map((work) => work.id),
        ...current.map((work) => work.id),
      ])
      return [...current, ...nextWorks.filter((work) => !ids.has(work.id))]
    })
    setLoadedPage(page)
  }, [fetcher.state, fetcher.data])

  const works = useMemo(
    () => [...props.works, ...extraWorks],
    [props.works, extraWorks],
  )

  const lastPage = Math.min(
    Math.max(Math.ceil(props.worksCount / TAG_PAGE_SIZE) - 1, 0),
    TAG_PAGE_MAX_PAGE,
  )
  const hasMore = !props.isR18Fallback && loadedPage < lastPage

  const loadMore = () => {
    fetcher.load(
      `${basePath}${toTagPageSearch({ ...query, page: loadedPage + 1 })}`,
    )
  }

  const hrefWith = (patch: Partial<TagPageQuery>) =>
    `${basePath}${toTagPageSearch({ ...query, page: 0, ...patch })}`

  const { data: followedTagsData } = useQuery(viewerFollowedTagsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 128 },
  })
  const isFollowedTag =
    followedTagsData?.viewer?.followingTags.some(
      (followed) => followed.name === props.tag,
    ) ?? false

  const coverWorks = props.works.slice(0, 3)
  const cover = coverWorks[0]

  const orderLabels: Record<TagPageOrderBy, string> = {
    LIKES_COUNT: t("人気", "Popular"),
    DATE_CREATED: t("新着", "Newest"),
    VIEWS_COUNT: t("閲覧数", "Most viewed"),
    BOOKMARKS_COUNT: t("ブックマーク", "Bookmarks"),
    COMMENTS_COUNT: t("コメント", "Comments"),
  }

  const ratingLabels: Record<TagPageRating, string> = {
    all: t("すべて", "All"),
    G: t("全年齢", "All ages"),
    R15: "R-15",
  }

  const tagHref = (name: string) => `/tags/${encodeURIComponent(name)}`
  const homeUrl = locale === "en" ? `${config.siteURL}/en` : config.siteURL
  const tagsUrl = `${homeUrl}/tags`
  const pageUrl = `${homeUrl}/tags/${encodeURIComponent(props.tag)}`

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t(`${props.tag}のAIイラスト・画像`, `${props.tag} AI art`),
    url: pageUrl,
    inLanguage: locale,
    about: { "@type": "Thing", name: props.tag },
    isPartOf: { "@type": "WebSite", name: "Aipictors", url: homeUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: props.worksCount,
      itemListElement: props.works.map((work, index) => ({
        "@type": "ListItem",
        position: query.page * TAG_PAGE_SIZE + index + 1,
        url: `${homeUrl}/posts/${work.id}`,
        name: locale === "en" && work.enTitle ? work.enTitle : work.title,
        image: work.largeThumbnailImageURL || work.smallThumbnailImageURL,
      })),
    },
  }

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Aipictors", item: homeUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: t("タグ", "Tags"),
        item: tagsUrl,
      },
      { "@type": "ListItem", position: 3, name: props.tag, item: pageUrl },
    ],
  }

  const topWork = props.works[0]
  const relatedNames = props.relatedTags.slice(0, 5).map((tag) => tag.name)

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 pb-10">
      {!props.isR18Fallback && props.works.length > 0 && (
        <AppJsonLdScript jsonLd={[jsonLd, breadcrumb]} />
      )}

      {/* パンくず */}
      <nav
        aria-label={t("パンくずリスト", "Breadcrumb")}
        className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-muted-foreground text-xs"
      >
        <Link to="/" className="hover:text-foreground">
          {t("ホーム", "Home")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <Link to="/tags" className="hover:text-foreground">
          {t("タグ", "Tags")}
        </Link>
        <ChevronRightIcon className="size-3 shrink-0" />
        <span className="truncate text-foreground">{props.tag}</span>
      </nav>

      {/* ヘッダー */}
      <header className="relative overflow-hidden rounded-2xl border bg-card">
        {cover && (
          <img
            src={cover.smallThumbnailImageURL}
            alt=""
            aria-hidden
            // 画面で一番大きい画像（LCP）になるので、一覧の画像より先に読み込む
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-25 blur-2xl"
          />
        )}
        <div className="relative flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-7 md:p-7">
          {coverWorks.length > 0 && (
            <div className="hidden shrink-0 gap-2 md:flex">
              {coverWorks.map((work, index) => (
                <Link
                  key={work.id}
                  to={`/posts/${work.id}`}
                  className={cn(
                    "block overflow-hidden rounded-xl border-2 border-background shadow-md",
                    index === 0 ? "size-28" : "mt-6 size-20",
                  )}
                >
                  <img
                    src={work.smallThumbnailImageURL}
                    alt={work.title}
                    width={work.smallThumbnailImageWidth}
                    height={work.smallThumbnailImageHeight}
                    className="size-full object-cover"
                    fetchPriority={index === 0 ? "high" : undefined}
                  />
                </Link>
              ))}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
              <HashIcon className="size-3.5" />
              {t("タグ", "Tag")}
            </p>
            <h1 className="break-words font-bold text-3xl leading-tight tracking-tight md:text-4xl">
              {props.tag}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t(
                `${props.worksCount.toLocaleString()}件のAIイラスト・画像`,
                `${props.worksCount.toLocaleString()} AI illustrations & images`,
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <TagFollowButton
              className="w-40"
              tag={props.tag}
              isFollow={isFollowedTag}
            />
            <TagActionOther tag={props.tag} />
          </div>
        </div>
      </header>

      {/* 関連タグ */}
      {props.relatedTags.length > 0 && (
        <section aria-labelledby="related-tags-heading" className="space-y-2">
          <h2
            id="related-tags-heading"
            className="font-semibold text-muted-foreground text-xs"
          >
            {t("関連タグ", "Related tags")}
          </h2>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {props.relatedTags.map((related) => (
              <Chip key={related.name} to={tagHref(related.name)}>
                <span className="text-muted-foreground/70">#</span>
                {related.name}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {/* 並び順・絞り込み */}
      <div className="flex flex-col gap-3 border-b pb-3 md:flex-row md:items-center md:justify-between">
        <div
          role="tablist"
          aria-label={t("並び順", "Sort")}
          className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]"
        >
          {(Object.keys(orderLabels) as TagPageOrderBy[]).map((orderBy) => {
            const isActive = query.orderBy === orderBy
            return (
              <Link
                key={orderBy}
                role="tab"
                aria-selected={isActive}
                to={hrefWith({ orderBy, sort: "DESC" })}
                preventScrollReset
                replace
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 font-medium text-sm transition-colors",
                  isActive
                    ? "bg-muted font-bold text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {orderLabels[orderBy]}
              </Link>
            )
          })}
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
          {(Object.keys(ratingLabels) as TagPageRating[]).map((rating) => (
            <Chip
              key={rating}
              to={hrefWith({ rating })}
              isActive={query.rating === rating}
              replace
            >
              {ratingLabels[rating]}
            </Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-border" />
          <Chip
            to={hrefWith({ hasPrompt: !query.hasPrompt })}
            isActive={query.hasPrompt}
            replace
          >
            <SparklesIcon className="size-3.5" />
            {t("プロンプトあり", "With prompt")}
          </Chip>
        </div>
      </div>

      {props.isR18Fallback && (
        <p className="rounded-xl border border-orange-500/30 bg-orange-500/5 px-4 py-3 text-orange-700 text-sm dark:text-orange-300">
          {t(
            "全年齢の作品が見つからないため、R18作品を表示しています。",
            "No all-ages works were found, so R18 works are shown.",
          )}{" "}
          <Link
            to={`/r/tags/${encodeURIComponent(props.tag)}`}
            className="font-medium underline"
          >
            {t("R18のタグページへ", "Open the R18 tag page")}
          </Link>
        </p>
      )}

      {/* 作品一覧 */}
      {works.length > 0 ? (
        <ResponsivePhotoWorksAlbum
          works={works}
          isShowProfile={true}
          priorityCount={4}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
          <p className="font-semibold">
            {t("作品が見つかりませんでした", "No works found")}
          </p>
          <p className="text-muted-foreground text-sm">
            {query.hasPrompt || query.rating !== "all"
              ? t(
                  "絞り込みを外すと見つかるかもしれません",
                  "Try removing the filters",
                )
              : t(
                  "このタグの作品はまだ投稿されていません",
                  "No works have been posted with this tag yet",
                )}
          </p>
          {(query.hasPrompt || query.rating !== "all") && (
            <Button asChild variant="outline" className="rounded-full">
              <Link to={basePath} replace>
                {t("絞り込みを外す", "Clear filters")}
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* もっと見る・ページ送り */}
      {works.length > 0 && (
        <div className="flex flex-col items-center gap-4 pt-2">
          {hasMore && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-12 w-full max-w-sm rounded-full font-semibold"
              onClick={loadMore}
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle" ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : null}
              {t("もっと見る", "Show more")}
            </Button>
          )}
          {!props.isR18Fallback && (
            <LinkPagination
              currentPage={query.page}
              totalCount={props.worksCount}
              perPage={TAG_PAGE_SIZE}
              maxPage={TAG_PAGE_MAX_PAGE}
              toHref={(page) => hrefWith({ page })}
              labels={{
                prev: t("前へ", "Prev"),
                next: t("次へ", "Next"),
                nav: t("ページ送り", "Pagination"),
              }}
            />
          )}
        </div>
      )}

      {/* このタグについて（作品の傾向をまとめた説明） */}
      {!props.isR18Fallback && props.works.length > 0 && (
        <section
          aria-labelledby="tag-about-heading"
          className="mt-4 grid gap-6 rounded-2xl border bg-muted/30 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] md:p-7"
        >
          <div className="space-y-3">
            <h2 id="tag-about-heading" className="font-bold text-lg">
              {t(
                `「${props.tag}」のAIイラストについて`,
                `About "${props.tag}" AI art`,
              )}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t(
                `Aipictors には「${props.tag}」タグが付いたAIイラスト・AI画像が${props.worksCount.toLocaleString()}件投稿されています。${
                  topWork
                    ? `いま人気の作品は「${topWork.title}」${topWork.user ? `（${topWork.user.name}）` : ""}などです。`
                    : ""
                }${
                  relatedNames.length > 0
                    ? `一緒に付けられることが多いタグは${relatedNames.map((name) => `「${name}」`).join("")}です。`
                    : ""
                }プロンプトが公開されている作品では、使われたモデルや生成の設定も確認できます。`,
                `Aipictors hosts ${props.worksCount.toLocaleString()} AI illustrations and images tagged "${props.tag}".${
                  topWork
                    ? ` A popular one right now is "${topWork.enTitle || topWork.title}"${topWork.user ? ` by ${topWork.user.name}` : ""}.`
                    : ""
                }${
                  relatedNames.length > 0
                    ? ` It is often used together with ${relatedNames.map((name) => `"${name}"`).join(", ")}.`
                    : ""
                } Works with public prompts also show the model and generation settings.`,
              )}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link to="/tags">{t("タグ一覧", "All tags")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link
                  to={`/search?age_limit=&tag=${encodeURIComponent(props.tag)}`}
                >
                  {t("このタグで詳しく検索", "Advanced search")}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Link to="/generation">
                  {t("AIで画像を生成する", "Generate images")}
                </Link>
              </Button>
            </div>
          </div>
          {props.creators.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                {t("このタグの作品が多いユーザー", "Top creators for this tag")}
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {props.creators.map((creator) => (
                  <li key={creator.id}>
                    <Link
                      to={`/users/${creator.id}`}
                      className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
                    >
                      <img
                        src={withIconUrlFallback(creator.iconUrl)}
                        alt=""
                        loading="lazy"
                        className="size-7 shrink-0 rounded-full object-cover"
                      />
                      <span className="truncate text-sm">{creator.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
