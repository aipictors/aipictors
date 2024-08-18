import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { AiModelArticle } from "~/routes/($lang)._main.models.$model/components/ai-model-article"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.model === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const url = new URL(props.request.url)

  const searchParams = new URLSearchParams(url.search)

  const r15 = searchParams.get("r15") === "1"

  const ratings: ("G" | "R15" | "R18" | "R18G")[] = r15 ? ["G", "R15"] : ["G"]

  const page = searchParams.get("page")
    ? Number.parseInt(searchParams.get("page") || "1", 10)
    : 0

  const hasPrompt = searchParams.get("prompt") === "1"

  const resp = await client.query({
    query: aiModelQuery,
    variables: {
      search: props.params.model,
      offset: page * 32,
      limit: 32,
      where: {
        ratings: ratings,
        isSensitive: false,
        hasPrompt: hasPrompt,
      },
    },
  })

  if (!resp.data.aiModel) {
    throw new Response(null, { status: 404 })
  }

  return json({
    data: resp.data.aiModel,
    page: page,
    isR15: r15,
    hasPrompt: hasPrompt,
  })
}

export const meta: MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: "モデル作品一覧" }]
  }

  const aiModel = data as {
    data: {
      id: string
      name: string
      type: "IMAGE" | null
      generationModelId: string | null
      workModelId: string | null
      thumbnailImageURL: string | null
      works: FragmentOf<typeof partialWorkFieldsFragment>[]
    }
  }

  if (!aiModel.data) {
    return [{ title: "モデル作品一覧" }]
  }

  const thumbnailUrl = aiModel.data.thumbnailImageURL
    ? aiModel.data.thumbnailImageURL
    : aiModel.data.works?.length
      ? aiModel.data.works[0].largeThumbnailImageURL
      : ""

  return createMeta(META.MODEL, {
    title: `${aiModel.data.name}モデルで生成された作品一覧（${aiModel.data.works.length}件）`,
    description: `${aiModel.data.name}モデルで生成された最新の作品一覧です、プロンプト情報など多数掲載されています`,
    url: thumbnailUrl,
  })
}

/**
 * モデルの詳細
 */
export default function ModelPage() {
  const params = useParams()

  if (params.model === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data.data === null) {
    throw new ParamsError()
  }

  if (!data.data.name) {
    throw new ParamsError()
  }

  return (
    <>
      <AiModelArticle
        name={data.data.name}
        thumbnailImageURL={
          data.data.thumbnailImageURL
            ? data.data.works[0].largeThumbnailImageURL
            : null
        }
        works={data.data.works}
        worksCount={data.data.works.length}
        isSensitive={false}
        isMoreRatings={data.isR15}
        hasPrompt={data.hasPrompt}
        page={data.page}
      />
    </>
  )
}

const aiModelQuery = graphql(
  `query AiModel($search: String!, $limit: Int!, $offset: Int!, $where: WorksWhereInput) {
    aiModel(where: {search: $search}) {
      id
      name
      type
      generationModelId
      workModelId
      thumbnailImageURL
      works(limit: $limit, offset: $offset, where: $where) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
