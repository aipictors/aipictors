import { Link, useLoaderData } from "@remix-run/react"
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
import type {
  MicroCmsApiRelease,
} from "~/types/micro-cms-release-response"
import { useTranslation } from "~/hooks/use-translation"
import { ChevronRight } from "lucide-react"
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
    data,
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

export default function Milestone () {
  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  const releases: MicroCmsApiRelease[] = data.data.contents
  const totalPages = Math.max(1, Math.ceil(data.data.totalCount / data.limit))
  const isFirstPage = data.page <= 1
  const isLastPage = data.page >= totalPages

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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <div className="container flex flex-col space-y-4">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg">{t("最新リリース一覧", "Latest Releases")}</h2>
        <form method="get" className="flex w-full gap-2 md:w-auto">
          <Input
            name="q"
            defaultValue={data.q}
            placeholder={t("お知らせ内容で検索", "Search announcements")}
            className="w-full md:w-72"
          />
          {data.selectedTag && <input type="hidden" name="tag" value={data.selectedTag} />}
          <Button type="submit" variant="secondary">
            {t("検索", "Search")}
          </Button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 px-4">
        <Button asChild variant={data.selectedTag === null ? "default" : "outline"} size="sm">
          <Link to={buildTagSearch(null)}>{t("すべて", "All")}</Link>
        </Button>
        {data.tags.map((tag) => (
          <Button
            key={tag}
            asChild
            variant={data.selectedTag === tag ? "default" : "outline"}
            size="sm"
            className="h-auto px-3 py-1.5"
          >
            <Link to={buildTagSearch(tag)}>
              <ReleaseTagBadge tag={tag} />
            </Link>
          </Button>
        ))}
      </div>
      {releases.map((release) => (
        <Link
          to={`/releases/${release.id}`}
          key={release.createdAt}
          className="group flex items-center justify-between gap-4 border-b px-4 py-3"
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span>{formatDate(release.createdAt)}</span>
              <ReleaseTagBadge tag={release.tag} className="px-1.5 py-0 text-[10px]" />
            </div>
            <p className="mt-1 line-clamp-1 font-semibold text-sm">
              {release.title}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Link>
      ))}
      {releases.length === 0 && (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-muted-foreground text-sm">
          {t(
            "条件に合うお知らせはありません。タグや検索語を変えてお試しください。",
            "No announcements matched. Try a different tag or keyword.",
          )}
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-3 pb-2">
        <div className="text-muted-foreground text-xs">
          {t(
            `${data.page} / ${totalPages} ページ`,
            `Page ${data.page} of ${totalPages}`,
          )}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" asChild disabled={isFirstPage}>
            <Link to={buildSearch(Math.max(1, data.page - 1))}>
              {t("前へ", "Previous")}
            </Link>
          </Button>
          <Button variant="secondary" asChild disabled={isLastPage}>
            <Link to={buildSearch(Math.min(totalPages, data.page + 1))}>
              {t("次へ", "Next")}
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <Link
          to="/roadmap"
          className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          {t("ロードマップを見る", "View Roadmap")}
        </Link>
        <Link
          target="_blank"
          rel="noreferrer"
          to={"https://github.com/aipictors/aipictors/releases"}
          className="text-blue-500 transition-colors hover:text-blue-600"
        >
          {"GitHub Releases"}
        </Link>
      </div>
    </div>
  )
}
