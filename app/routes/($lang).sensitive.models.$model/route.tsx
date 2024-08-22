import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { AiModelArticle } from "~/routes/($lang)._main.models.$model/components/ai-model-article"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { WorkListItemFragment } from "~/routes/($lang)._main.posts._index/components/work-list"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.model === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const url = new URL(props.request.url)

  const searchParams = new URLSearchParams(url.search)

  const r18g = searchParams.get("r18g") === "1"

  const ratings: ("G" | "R15" | "R18" | "R18G")[] = r18g
    ? ["R18", "R18G"]
    : ["R18"]

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
        isSensitive: true,
      },
    },
  })

  if (!resp.data.aiModel) {
    throw new Response(null, { status: 404 })
  }

  return json({
    data: resp.data.aiModel,
    page: page,
    isR18G: r18g,
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
      works: FragmentOf<typeof WorkListItemFragment>[]
    }
  }

  return createMeta(META.MODEL, {
    title: `${aiModel.data.name}モデルで生成されたR18作品一覧（${aiModel.data.works.length}件）`,
    description: `${aiModel.data.name}モデルで生成されたR18最新の作品一覧です、プロンプト情報など多数掲載されています`,
    url: config.defaultSensitiveOgpImageUrl,
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
            ? data.data.works[0].smallThumbnailImageURL
            : null
        }
        works={data.data.works}
        worksCount={data.data.worksCount}
        isSensitive={true}
        isMoreRatings={data.isR18G}
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
      worksCount
      generationModelId
      workModelId
      thumbnailImageURL
      works(limit: $limit, offset: $offset, where: $where) {
        ...WorkListItem
      }
    }
  }`,
  [WorkListItemFragment],
)
