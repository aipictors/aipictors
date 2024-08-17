import { json, Link, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { createClient as createCmsClient } from "microcms-js-sdk"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.RELEASES)
}

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
  const limit = 16
  const offset = props.params.offset ? Number(props.params.offset) : 0

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const data: ApiResponse = await microCmsClient.get({
    endpoint: `releases?orders=-createdAt&limit=${limit}&offset=${offset}`,
  })

  return json({
    data,
  })
}

export default function Milestone() {
  const data = useLoaderData<typeof loader>()

  console.log(data)

  const [limit] = useState(10)
  const [offset, setOffset] = useState(data.data.offset)

  const releases: Release[] = data.data.contents

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
      <h2 className="border-b p-4">最新リリース一覧</h2>
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
        <Button onClick={handlePrevious} disabled={offset === 0}>
          前へ
        </Button>
        <Button
          onClick={handleNext}
          disabled={offset + limit >= data.data.totalCount}
        >
          次へ
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
