import { json, Link, useLoaderData } from "react-router"
import { createClient as createCmsClient } from "microcms-js-sdk"
import { Button } from "~/components/ui/button"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { ReleaseItem } from "~/routes/($lang)._main.releases.$id._index/components/release-item"
import { config } from "~/config"

interface Release {
  id: string
  title: string
  description: string
  thumbnail_url: {
    url: string
  }
  platform: string
  createdAt: number
}

interface ApiResponse {
  contents: Release[]
  totalCount: number
  offset: number
  limit: number
}

export async function loader(props: LoaderFunctionArgs) {
  const limit = 10

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
    endpoint: `releases?orders=createdAt&limit=${limit}`,
  })

  return json({
    data,
    list,
  })
}

export default function Release() {
  const data = useLoaderData<typeof loader>()

  const release: Release = data.data.contents[0]

  const releases: Release[] = data.list.contents

  const handleMoveList = () => {
    if (window) {
      window.location.href = "/releases"
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  return (
    <div className="container flex flex-col space-y-4">
      <ReleaseItem
        title={release.title}
        description={release.description}
        thumbnailUrl={release.thumbnail_url ? release.thumbnail_url.url : null}
        platform={release.platform}
        createdAt={release.createdAt}
      />
      <h2 className="border-b p-4">{"最新リリース一覧"}</h2>
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
              className="h-16 w-16 rounded-md object-cover"
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
        <Button onClick={handleMoveList}>{"一覧へ戻る"}</Button>
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
