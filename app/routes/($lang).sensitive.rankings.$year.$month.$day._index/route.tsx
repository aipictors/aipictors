import { ParamsError } from "~/errors/params-error"
import { workAwardFieldsFragment } from "~/graphql/fragments/work-award-field"
import { createClient } from "~/lib/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { RankingSensitiveHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-header"
import { RankingSensitiveWorkList } from "~/routes/($lang)._main.rankings._index/components/ranking-sensitive-work-list"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors | ランキング"

  const metaDescription =
    "AIで作った画像を公開してみよう！AIイラスト・生成サイト「AIピクターズ」、AIイラスト・AIフォト・AIグラビア・AI小説投稿サイトのランキングページです。"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export async function loader(props: LoaderFunctionArgs) {
  const client = createClient()

  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        year: year,
        month: month,
        day: day,
        isSensitive: true,
      },
    },
  })

  return json({
    workAwards: workAwardsResp.data.workAwards,
  })
}

export default function SensitiveAwardsPage() {
  const data = useLoaderData<typeof loader>()

  const params = useParams<"year" | "month" | "day">()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw new ParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  const day = Number.parseInt(params.day)

  return (
    <>
      <RankingSensitiveHeader
        year={year}
        month={month}
        day={day}
        weekIndex={null}
      />
      <RankingSensitiveWorkList
        year={year}
        month={month}
        day={day}
        awards={data.workAwards}
        weekIndex={null}
      />
    </>
  )
}

const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      ...WorkAwardFields
    }
  }`,
  [workAwardFieldsFragment],
)
