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

const IMPORTANT_RELEASE_DISPLAY_WINDOW_MS = 48 * 60 * 60 * 1000

const toReleaseTimestampMs = (value: string | number | null | undefined) => {
  if (typeof value === "number") {
    return value < 1_000_000_000_000 ? value * 1000 : value
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return null
}

export const getReleasePublishedAtMs = (release: Pick<MicroCmsApiRelease, "createdAt" | "publishedAt">) => {
  return toReleaseTimestampMs(release.publishedAt ?? release.createdAt)
}

export const isImportantReleaseVisible = (
  release: Pick<MicroCmsApiRelease, "createdAt" | "publishedAt" | "is_important"> | null | undefined,
  now = Date.now(),
) => {
  if (!release?.is_important) {
    return false
  }

  const publishedAtMs = getReleasePublishedAtMs(release)

  if (publishedAtMs === null || publishedAtMs > now) {
    return false
  }

  return now - publishedAtMs <= IMPORTANT_RELEASE_DISPLAY_WINDOW_MS
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

export async function fetchLatestImportantRelease() {
  const client = createMicroCmsClient()
  const query = new URLSearchParams({
    filters: "is_important[equals]true",
    limit: "1",
    orders: "-publishedAt",
  })

  const response = await client.get<MicroCmsApiReleaseResponse>({
    endpoint: `releases?${query.toString()}`,
  })

  return response.contents[0] ?? null
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