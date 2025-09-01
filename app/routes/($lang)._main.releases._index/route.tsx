import { Link, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
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

export const meta: MetaFunction = (props) => {
  return createMeta(META.RELEASES, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const limit = 16

  const offset = props.params.offset ? Number(props.params.offset) : 0

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const data: MicroCmsApiReleaseResponse = await microCmsClient.get({
    endpoint: `releases?orders=-createdAt&limit=${limit}&offset=${offset}`,
  })

  return {
    data,
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

  const [limit] = useState(10)

  const [offset, setOffset] = useState(data.data.offset)

  const releases: MicroCmsApiRelease[] = data.data.contents

  const handleNext = () => {
    setOffset(offset + limit)
  }

  const handlePrevious = () => {
    if (offset - limit >= 0) {
      setOffset(offset - limit)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <div className="container flex flex-col space-y-4">
      <h2 className="border-b p-4">
        {t("最新リリース一覧", "Latest Releases")}
      </h2>
      {releases.map((release) => (
        <Link
          to={`/releases/${release.id}`}
          key={release.createdAt}
          className="flex items-center space-x-4 border-b p-4"
        >
          {release.thumbnail_url && (
            <img
              src={release.thumbnail_url.url}
              alt={release.title}
              className="size-16 rounded-md object-cover"
            />
          )}
          <div className="flex flex-1 flex-col">
            <div className="flex justify-between">
              <p className="font-bold text-lg">{release.title}</p>
              <p className="text-sm">{formatDate(release.createdAt)}</p>
            </div>
            <p className="line-clamp-2 text-sm">{release.description}</p>
          </div>
        </Link>
      ))}
      <div className="flex items-center justify-center space-x-4">
        <Button onClick={handlePrevious} disabled={offset === 0}>
          {t("前へ", "Previous")}
        </Button>
        <Button
          onClick={handleNext}
          disabled={offset + limit >= data.data.totalCount}
        >
          {t("次へ", "Next")}
        </Button>
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
