import { Link, useLoaderData } from "@remix-run/react"
import { createClient as createCmsClient } from "microcms-js-sdk"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { ReleaseItem } from "~/routes/($lang)._main.releases.$id._index/components/release-item"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { ChevronRight } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"

interface Release {
  id: string
  title: string
  description: string
  thumbnail_url?: {
    url: string
  }
  platform: string
  tag?: string | null
  createdAt: number
}

interface ApiResponse {
  contents: Release[]
  totalCount: number
  offset: number
  limit: number
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const pageParam = url.searchParams.get("page")
  const qParam = url.searchParams.get("q")?.trim() ?? ""
  const limit = 10
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * limit

  if (!props.params.id) {
    // 404
    throw new Response(null, { status: 404 })
  }

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const data: ApiResponse = await microCmsClient.get({
    endpoint: `releases?ids=${props.params.id}`,
  })

  const list: ApiResponse = await microCmsClient.get({
    endpoint: `releases?${new URLSearchParams({
      orders: "-createdAt",
      limit: String(limit),
      offset: String(offset),
      ...(qParam.length > 0 ? { q: qParam } : {}),
    }).toString()}`,
  })

  return {
    data,
    list,
    page,
    limit,
    q: qParam,
  }
}

export const headers: HeadersFunction = () => ({
  // 急なお知らせ変更などの可能性があるため、キャッシュを利用しない
  // "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  const response = props.data as { data: ApiResponse }

  const url = !response.data.contents[0].thumbnail_url
    ? ""
    : response.data.contents[0].thumbnail_url.url

  return createMeta(
    META.RELEASE,
    {
      title: `${response.data.contents[0].title}`,
      enTitle: `${response.data.contents[0].title}`,
      description: response.data.contents[0].description || "",
      enDescription: response.data.contents[0].description || "",
      url: url,
    },
    props.params.lang,
  )
}

export default function Release () {
  const t = useTranslation()
  const data = useLoaderData<typeof loader>()

  const release: Release = data.data.contents[0]

  const releases: Release[] = data.list.contents

  const totalPages = Math.max(1, Math.ceil(data.list.totalCount / data.limit))
  const isFirstPage = data.page <= 1
  const isLastPage = data.page >= totalPages

  const buildSearch = (page: number) => {
    const params = new URLSearchParams()
    if (data.q.length > 0) {
      params.set("q", data.q)
    }
    params.set("page", String(page))
    return `?${params.toString()}`
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
      <ReleaseItem
        title={release.title}
        description={release.description}
        thumbnailUrl={release.thumbnail_url ? release.thumbnail_url.url : null}
        platform={release.platform}
        tag={release.tag}
        createdAt={release.createdAt}
      />
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg">{"最新リリース一覧"}</h2>
        <form method="get" className="flex w-full gap-2 md:w-auto">
          <Input
            name="q"
            defaultValue={data.q}
            placeholder={t("お知らせ内容で検索", "Search announcements")}
            className="w-full md:w-72"
          />
          <Button type="submit" variant="secondary">
            {t("検索", "Search")}
          </Button>
        </form>
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
              {release.tag && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
                  {release.tag}
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-1 font-semibold text-sm">
              {release.title}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Link>
      ))}
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
        <Button variant="secondary" asChild>
          <Link
            to={`/releases${data.q ? `?q=${encodeURIComponent(data.q)}` : ""}`}
          >
            {t("一覧へ戻る", "Back to list")}
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <Link
          target="_blank"
          rel="noreferrer"
          to={"https://github.com/aipictors/aipictors/releases"}
        >
          {"GitHub Releases"}
        </Link>
      </div>
    </div>
  )
}
