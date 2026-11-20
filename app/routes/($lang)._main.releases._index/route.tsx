import { useLoaderData } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { ReleaseTagBadge } from "~/components/release-tag-badge"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { toReleaseCard } from "~/utils/release-card"
import { useTranslation } from "~/hooks/use-translation"
import { ArrowRight, SearchIcon } from "lucide-react"
import { ReleaseCardView } from "~/components/release/release-card-view"
import { PictorChanSays } from "~/components/pictor-chan-says"
import {
  featuredReleaseTags,
  fetchReleaseList,
  isFeaturedReleaseTag,
  type FeaturedReleaseTag,
} from "~/utils/micro-cms-release"

export const meta: MetaFunction = (props) => {
  return createMeta(META.RELEASES, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)
  const pageParam = url.searchParams.get("page")
  const qParam = url.searchParams.get("q")?.trim() ?? ""
  const tagParam = url.searchParams.get("tag")
  const selectedTag = isFeaturedReleaseTag(tagParam) ? tagParam : null
  const limit = 16
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * limit

  const data = await fetchReleaseList({
    limit,
    offset,
    q: qParam,
    tag: selectedTag,
  })

  return {
    // 一覧には本文全体を入れず、カードに出す分だけにする
    releases: data.contents.map((release) => toReleaseCard(release)),
    totalCount: data.totalCount,
    page,
    limit,
    q: qParam,
    selectedTag,
    tags: featuredReleaseTags,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export default function Milestone() {
  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  const { releases } = data
  const totalPages = Math.max(1, Math.ceil(data.totalCount / data.limit))
  const isFirstPage = data.page <= 1
  const isLastPage = data.page >= totalPages
  // 絞り込みのない最初のページだけ、最新のお知らせを大きく出す
  const isFeatured =
    isFirstPage && data.q.length === 0 && data.selectedTag === null
  const [featured, ...rest] = releases
  const gridReleases = isFeatured ? rest : releases

  const buildSearch = (page: number) => {
    const params = new URLSearchParams()
    if (data.q.length > 0) {
      params.set("q", data.q)
    }
    if (data.selectedTag) {
      params.set("tag", data.selectedTag)
    }
    params.set("page", String(page))
    return `?${params.toString()}`
  }

  const buildTagSearch = (tag: FeaturedReleaseTag | null) => {
    const params = new URLSearchParams()
    if (data.q.length > 0) {
      params.set("q", data.q)
    }
    if (tag) {
      params.set("tag", tag)
    }
    return params.toString() ? `?${params.toString()}` : "?"
  }

  return (
    <div className="container flex flex-col gap-6 pt-2 pb-12 md:gap-8 md:pt-4">
      <header className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-sky-50 via-white to-violet-50 px-5 py-6 md:px-8 md:py-8 dark:from-sky-950/40 dark:via-background dark:to-violet-950/40">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-bold text-primary text-xs tracking-[0.2em]">
              NEWS & RELEASES
            </p>
            <h1 className="font-black text-2xl text-foreground tracking-tight md:text-3xl">
              {t("お知らせ", "Announcements")}
            </h1>
            <p className="text-foreground/75 text-sm leading-relaxed">
              {t(
                "Aipictors の新機能・不具合対応・メンテナンスのお知らせです。",
                "New features, bug fixes, and maintenance news from Aipictors.",
              )}
            </p>
          </div>
          <form method="get" className="flex w-full gap-2 md:w-80">
            <div className="relative flex-1">
              <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                defaultValue={data.q}
                placeholder={t("お知らせを検索", "Search announcements")}
                aria-label={t("お知らせ内容で検索", "Search announcements")}
                className="h-11 rounded-full bg-background pl-9 text-base md:text-sm"
              />
            </div>
            {data.selectedTag && (
              <input type="hidden" name="tag" value={data.selectedTag} />
            )}
            <Button type="submit" className="h-11 rounded-full px-5">
              {t("検索", "Search")}
            </Button>
          </form>
        </div>
        <nav
          aria-label={t("種類で絞り込む", "Filter by type")}
          className="mt-5 flex flex-wrap gap-2"
        >
          <Button
            asChild
            variant={data.selectedTag === null ? "default" : "outline"}
            size="sm"
            className="h-9 rounded-full bg-background px-4"
          >
            <Link to={buildTagSearch(null)}>{t("すべて", "All")}</Link>
          </Button>
          {data.tags.map((tag) => (
            <Button
              key={tag}
              asChild
              variant="outline"
              size="sm"
              className={
                data.selectedTag === tag
                  ? "h-9 rounded-full px-2 ring-2 ring-primary ring-offset-1 ring-offset-background"
                  : "h-9 rounded-full bg-background px-2"
              }
            >
              <Link to={buildTagSearch(tag)}>
                <ReleaseTagBadge tag={tag} className="border-none" />
              </Link>
            </Button>
          ))}
        </nav>
      </header>

      {data.q.length > 0 && (
        <p className="text-foreground/80 text-sm">
          {t(
            `「${data.q}」のお知らせ ${data.totalCount}件`,
            `${data.totalCount} results for "${data.q}"`,
          )}
        </p>
      )}

      {isFeatured && featured && (
        <ReleaseCardView release={featured} variant="featured" isPriority />
      )}

      {gridReleases.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {gridReleases.map((release, index) => (
            <ReleaseCardView
              key={release.id}
              release={release}
              variant="grid"
              isPriority={!isFeatured && index < 3}
            />
          ))}
        </div>
      )}

      {releases.length === 0 && (
        <div className="flex justify-center rounded-2xl border border-dashed px-4 py-10">
          <PictorChanSays>
            {t(
              "条件に合うお知らせはありませんでした。タグや検索語を変えてみてくださいね！",
              "No announcements matched. Try a different tag or keyword!",
            )}
          </PictorChanSays>
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-muted-foreground text-sm tabular-nums">
          {t(
            `${data.page} / ${totalPages} ページ`,
            `Page ${data.page} of ${totalPages}`,
          )}
        </div>
        <div className="flex items-center justify-center gap-2">
          {isFirstPage ? (
            <Button
              variant="outline"
              disabled
              className="h-11 rounded-full px-6"
            >
              {t("前へ", "Previous")}
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              className="h-11 rounded-full px-6"
            >
              <Link to={buildSearch(data.page - 1)}>
                {t("前へ", "Previous")}
              </Link>
            </Button>
          )}
          {isLastPage ? (
            <Button
              variant="outline"
              disabled
              className="h-11 rounded-full px-6"
            >
              {t("次へ", "Next")}
            </Button>
          ) : (
            <Button
              variant="outline"
              asChild
              className="h-11 rounded-full px-6"
            >
              <Link to={buildSearch(data.page + 1)}>{t("次へ", "Next")}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-6">
        <Link
          to="/roadmap"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-5 py-2 font-medium text-sm transition-colors hover:bg-accent"
        >
          {t("ロードマップを見る", "View Roadmap")}
          <ArrowRight className="size-4" />
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          to={"https://github.com/aipictors/aipictors/releases"}
          className="inline-flex min-h-11 items-center text-primary text-sm underline-offset-4 hover:underline"
        >
          {"GitHub Releases"}
        </Link>
      </div>
    </div>
  )
}
