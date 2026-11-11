import { graphql } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { loaderClient } from "~/lib/loader-client"
import {
  aggregateModels,
  aggregatePromptTokens,
  aggregateRelatedTags,
  toPromptExcerpt,
} from "~/lib/seo-hubs/seo-hub-aggregate"
import {
  findHubModel,
  findHubTag,
  HUB_MIN_INDEX_WORKS,
  HUB_MIN_PROMPT_WORKS,
  type HubTagKind,
  toHubModelPath,
  toTagLinkPath,
} from "~/lib/seo-hubs/seo-hub-catalog.server"
import {
  isBlockedHubModel,
  isBlockedHubTag,
  isSafeHubPrompt,
  isSafeHubWork,
} from "~/lib/seo-hubs/seo-hub-safety"
import { toListWorks } from "~/utils/to-list-works"

/**
 * 呪文まとめ（/prompts/tags/:tag・/prompts/models/:model と /r 側）のデータ
 *
 * 1 ページで API に 2〜3 本（作品数・呪文付きの作品・新着）。ページは配信のキャッシュに 1 日載せるので、
 * D1 の読み取りは 1 ページ・1 拠点あたり 1 日 1 回程度
 */

const HubWorkFragment = graphql(
  `fragment SeoHubWork on WorkNode @_unmask {
    ...PhotoAlbumWork
    prompt
    negativePrompt
    model
    likesCount
    createdAt
  }`,
  [PhotoAlbumWorkFragment],
)

const tagWorksQuery = graphql(
  `query SeoHubTagWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...SeoHubWork
    }
  }`,
  [HubWorkFragment],
)

const tagWorksCountQuery = graphql(
  `query SeoHubTagWorksCount($where: TagWorksCountWhereInput!) {
    tagWorksCount(where: $where)
  }`,
)

const modelQuery = graphql(
  `query SeoHubModel(
    $search: String!
    $countWhere: WorksWhereInput
    $firstWhere: WorksWhereInput
    $limit: Int!
  ) {
    aiModel(where: { search: $search }) {
      id
      name
      thumbnailImageURL
      worksCount(where: $countWhere)
      first: works(offset: 0, limit: $limit, where: $firstWhere) {
        ...SeoHubWork
      }
      second: works(offset: $limit, limit: $limit, where: $firstWhere) {
        ...SeoHubWork
      }
    }
  }`,
  [HubWorkFragment],
)

type HubWork = NonNullable<
  Awaited<ReturnType<typeof fetchTagWorks>>
>[number]

const fetchTagWorks = async (props: {
  tag: string
  isSensitive: boolean
  orderBy: "LIKES_COUNT" | "DATE_CREATED"
  hasPrompt: boolean
  limit: number
}) => {
  const resp = await loaderClient.query({
    query: tagWorksQuery,
    variables: {
      offset: 0,
      limit: props.limit,
      where: {
        tagNames: [props.tag],
        ratings: props.isSensitive ? ["R18"] : ["G"],
        orderBy: props.orderBy,
        sort: "DESC",
        isNowCreatedAt: true,
        ...(props.hasPrompt && { hasPrompt: true, isPromptPublic: true }),
        ...(props.isSensitive && { isSensitive: true }),
      },
    },
  })
  return resp.data.tagWorks
}

const MAX_WORKS_PER_USER = 2

const limitPerUser = (works: HubWork[], max: number) => {
  const counts = new Map<string, number>()
  return works.filter((work) => {
    const userId = work.user?.id ?? `work-${work.id}`
    const count = counts.get(userId) ?? 0
    counts.set(userId, count + 1)
    return count < max
  })
}

const ratingsOf = (isSensitive: boolean) =>
  isSensitive ? (["R18"] as const) : (["G"] as const)

/** 呪文を見せてよい作品か（公開設定と中身の両方） */
const hasVisiblePrompt = (work: HubWork) =>
  work.promptAccessType === "PUBLIC" && (work.prompt ?? "").trim().length > 0

const toExample = (work: HubWork, isSensitive: boolean) => ({
  workId: work.id,
  title: work.title,
  enTitle: work.enTitle,
  thumbnailUrl: work.smallThumbnailImageURL,
  likesCount: work.likesCount,
  model: work.model && !isBlockedHubModel(work.model) ? work.model : null,
  prompt: toPromptExcerpt(work.prompt ?? ""),
  /** 生成画面に渡す呪文（長すぎる URL にしない） */
  generationPrompt: (work.prompt ?? "").slice(0, 600),
  negativePrompt:
    work.negativePrompt && isSafeHubPrompt(work.negativePrompt, { isSensitive })
      ? toPromptExcerpt(work.negativePrompt, 200)
      : null,
})

/**
 * 集計とページの組み立て（タグ・モデルで共通）
 */
const buildHub = (props: {
  name: string
  isSensitive: boolean
  worksCount: number
  promptWorks: HubWork[]
  latestWorks: HubWork[]
  /** 人気作品を手元で並べ直す（モデルは新しい順でしか速く取れない） */
  sortByLikes: boolean
}) => {
  const { isSensitive } = props
  const safe = (works: HubWork[]) =>
    works.filter((work) => isSafeHubWork(work, { isSensitive }))
  // たくさん投稿する 1 人の呪文で集計が偏らないように、1 人 2 作品までにする
  const promptWorks = limitPerUser(
    (props.sortByLikes
      ? [...props.promptWorks].sort((a, b) => b.likesCount - a.likesCount)
      : props.promptWorks
    ).filter((work) => hasVisiblePrompt(work) && isSafeHubWork(work, { isSensitive })),
    MAX_WORKS_PER_USER,
  )
  const popular = promptWorks
  const popularIds = new Set(popular.slice(0, 24).map((work) => work.id))
  const latest = limitPerUser(safe(props.latestWorks), 3)
    .filter((work) => !popularIds.has(work.id))
    .slice(0, 12)

  const tokens = aggregatePromptTokens(promptWorks)
  const isTagBlocked = (name: string) => isBlockedHubTag(name, { isSensitive })
  const relatedTags = aggregateRelatedTags(
    [...promptWorks, ...latest],
    props.name,
    { isBlocked: isTagBlocked, limit: 20 },
  ).map((tag) => ({ ...tag, path: toTagLinkPath(tag.name, isSensitive) }))
  const models = aggregateModels(promptWorks, {
    isBlocked: isBlockedHubModel,
  }).map((model) => ({
    ...model,
    path: findHubModel(model.name, isSensitive)
      ? toHubModelPath(model.name, isSensitive)
      : `${isSensitive ? "/r" : ""}/models/${encodeURIComponent(model.name)}`,
  }))

  return {
    worksCount: props.worksCount,
    promptWorksCount: promptWorks.length,
    popularWorks: toListWorks(popular.slice(0, 24)),
    latestWorks: toListWorks(latest),
    tokens,
    relatedTags,
    models,
    examples: popular
      .slice(0, 4)
      .map((work) => toExample(work, isSensitive)),
    /** 薄いページ（作品・呪文が少ない）は検索エンジンに載せない */
    isIndexable:
      props.worksCount >= HUB_MIN_INDEX_WORKS &&
      promptWorks.length >= HUB_MIN_PROMPT_WORKS,
  }
}

export async function fetchTagHub(props: { tag: string; isSensitive: boolean }) {
  const { tag, isSensitive } = props
  const catalogTag = findHubTag(tag, isSensitive)
  // 索引にないタグは、まとめに載せない語（未成年・性的な語など）なら 404
  if (!catalogTag && isBlockedHubTag(tag, { isSensitive })) return null

  const [worksCount, promptWorks, latestWorks] = await Promise.all([
    loaderClient
      .query({
        query: tagWorksCountQuery,
        variables: { where: { tagName: tag, ratings: [...ratingsOf(isSensitive)] } },
      })
      .then((resp) => resp.data.tagWorksCount),
    fetchTagWorks({
      tag,
      isSensitive,
      orderBy: "LIKES_COUNT",
      hasPrompt: true,
      limit: 64,
    }),
    fetchTagWorks({
      tag,
      isSensitive,
      orderBy: "DATE_CREATED",
      hasPrompt: false,
      limit: 24,
    }),
  ])
  if (worksCount === 0 && promptWorks.length === 0) return null

  const kind: HubTagKind = catalogTag?.kind ?? "tag"
  return {
    type: "tag" as const,
    name: catalogTag?.name ?? tag,
    tagKind: kind as HubTagKind | null,
    isSensitive,
    thumbnailUrl: null as string | null,
    ...buildHub({
      name: tag,
      isSensitive,
      worksCount,
      promptWorks,
      latestWorks,
      sortByLikes: false,
    }),
  }
}

export async function fetchModelHub(props: {
  model: string
  isSensitive: boolean
}) {
  const { model, isSensitive } = props
  if (isBlockedHubModel(model)) return null
  const where = {
    ratings: [...ratingsOf(isSensitive)],
    ...(isSensitive && { isSensitive: true }),
  }
  const resp = await loaderClient.query({
    query: modelQuery,
    variables: {
      search: model,
      countWhere: where,
      firstWhere: {
        ...where,
        hasPrompt: true,
        isPromptPublic: true,
        orderBy: "DATE_CREATED",
        sort: "DESC",
      },
      limit: 64,
    },
  })
  const aiModel = resp.data.aiModel
  if (!aiModel || aiModel.worksCount === 0) return null
  const works = [...aiModel.first, ...aiModel.second]

  return {
    type: "model" as const,
    name: aiModel.name,
    tagKind: null as HubTagKind | null,
    isSensitive,
    thumbnailUrl: isSensitive ? null : (aiModel.thumbnailImageURL ?? null),
    ...buildHub({
      name: aiModel.name,
      isSensitive,
      worksCount: aiModel.worksCount,
      promptWorks: works,
      latestWorks: works,
      sortByLikes: true,
    }),
  }
}

export type SeoHubData =
  | NonNullable<Awaited<ReturnType<typeof fetchTagHub>>>
  | NonNullable<Awaited<ReturnType<typeof fetchModelHub>>>
