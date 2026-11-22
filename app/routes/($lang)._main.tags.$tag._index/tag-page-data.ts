import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { TAG_PAGE_SIZE } from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"

/**
 * タグページの作品の取得（全年齢 /tags/:tag と R18 /r/tags/:tag で共通）
 */

type TagWork = NonNullable<Awaited<ReturnType<typeof fetchTagWorks>>>[number]

export async function fetchTagWorks(props: {
  tagName: string
  page: number
  orderBy: IntrospectionEnum<"WorkOrderBy">
  sort: "ASC" | "DESC"
  ratings: ("G" | "R15" | "R18" | "R18G")[]
  hasPrompt: boolean
  isSensitive: boolean
}) {
  const resp = await loaderClient.query({
    query: tagPageWorksQuery,
    variables: {
      offset: props.page * TAG_PAGE_SIZE,
      limit: TAG_PAGE_SIZE,
      where: {
        tagNames: [props.tagName],
        orderBy: props.orderBy,
        sort: props.sort,
        ratings: props.ratings,
        ...(props.hasPrompt && { hasPrompt: true, isPromptPublic: true }),
        ...(props.isSensitive && { isSensitive: true }),
        isNowCreatedAt: true,
      },
    },
  })
  return resp.data.tagWorks
}

export async function fetchTagWorksCount(
  tagName: string,
  ratings: ("G" | "R15" | "R18" | "R18G")[],
) {
  const resp = await loaderClient.query({
    query: tagPageWorksCountQuery,
    variables: { where: { tagName, ratings } },
  })
  return resp.data.tagWorksCount
}

/**
 * 一覧に出ている作品のタグから、よく一緒に付けられているタグを数える（英語名は作品の enTagNames から）
 */
export const collectRelatedTags = (
  works: Pick<TagWork, "tagNames" | "enTagNames">[],
  tagName: string,
) => {
  const counts = new Map<string, number>()
  const enNames = new Map<string, string>()
  const current = tagName.toLowerCase()
  for (const work of works) {
    const seen = new Set<string>()
    work.tagNames.forEach((name, index) => {
      const trimmed = name.trim()
      if (trimmed.length === 0 || trimmed.toLowerCase() === current) return
      const enName = work.enTagNames?.[index]?.trim()
      if (enName && !enNames.has(trimmed)) enNames.set(trimmed, enName)
      if (seen.has(trimmed)) return
      seen.add(trimmed)
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
    })
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2 || works.length < 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24)
    .map(([name, count]) => ({
      name,
      enName: enNames.get(name) ?? null,
      count,
    }))
}

/**
 * 一覧に出ている作品の投稿者（作品数の多い順）
 */
export const collectCreators = (works: TagWork[]) => {
  const creators = new Map<
    string,
    { id: string; name: string; iconUrl: string | null; count: number }
  >()
  for (const work of works) {
    if (!work.user) continue
    const current = creators.get(work.user.id)
    if (current) {
      current.count += 1
    } else {
      creators.set(work.user.id, {
        id: work.user.id,
        name: work.user.name,
        iconUrl: work.user.iconUrl ?? null,
        count: 1,
      })
    }
  }
  return Array.from(creators.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
}

const tagPageWorksQuery = graphql(
  `query TagPageWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
      tagNames
      enTagNames
      createdAt
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const tagPageWorksCountQuery = graphql(
  `query TagPageWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)
