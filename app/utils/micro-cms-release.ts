import { createClient as createCmsClient } from "microcms-js-sdk"
import { config } from "~/config"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"

export const featuredReleaseTags = [
  "アップデート",
  "不具合対応",
  "メンテナンス",
] as const

export type FeaturedReleaseTag = (typeof featuredReleaseTags)[number]

export const isFeaturedReleaseTag = (
  value: string | null | undefined,
): value is FeaturedReleaseTag => {
  return featuredReleaseTags.some((tag) => tag === value)
}

const createMicroCmsClient = () => {
  return createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })
}

type FetchReleaseListOptions = {
  limit: number
  offset?: number
  q?: string
  tag?: FeaturedReleaseTag | null
}

export async function fetchReleaseList(
  options: FetchReleaseListOptions,
): Promise<MicroCmsApiReleaseResponse> {
  const client = createMicroCmsClient()
  const query = new URLSearchParams({
    orders: "-createdAt",
    limit: String(options.limit),
    offset: String(options.offset ?? 0),
  })

  if (options.q && options.q.trim().length > 0) {
    query.set("q", options.q.trim())
  }

  if (options.tag) {
    query.set("filters", `tag[equals]${options.tag}`)
  }

  return await client.get({
    endpoint: `releases?${query.toString()}`,
  })
}

export async function fetchFeaturedTaggedReleases() {
  const groups = await Promise.all(
    featuredReleaseTags.map(async (tag) => {
      const response = await fetchReleaseList({
        limit: 1,
        tag,
      }).catch<MicroCmsApiReleaseResponse>(() => ({
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 1,
      }))

      return response.contents[0] ?? null
    }),
  )

  return groups.filter((release): release is MicroCmsApiRelease => release !== null)
}