import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createClient as createCmsClient } from "microcms-js-sdk"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { useTranslation } from "~/hooks/use-translation"
import { ChevronRight } from "lucide-react"

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
  const limit = 16
  const page = Math.max(1, Number(pageParam) || 1)
  const offset = (page - 1) * limit

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const query = new URLSearchParams({
    orders: "-createdAt",
    limit: String(limit),
    offset: String(offset),
  })
  if (qParam.length > 0) {
    query.set("q", qParam)
  }

  const data: MicroCmsApiReleaseResponse = await microCmsClient.get({
    endpoint: `releases?${query.toString()}`,
  })

  return {
    data,
    page,
    limit,
    q: qParam,
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
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg">{t("最新リリース一覧", "Latest Releases")}</h2>
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
