import { ParamsError } from "@/_errors/params-error"
import { createClient } from "@/_lib/client"
import { toRatingText } from "@/_utils/work/to-rating-text"
import { workArticleFragment } from "@/routes/($lang)._main.posts.$post/_components/work-article"
import { commentFragment } from "@/routes/($lang)._main.posts.$post/_components/work-comment-list"
import { WorkContainer } from "@/routes/($lang)._main.posts.$post/_components/work-container"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Suspense } from "react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
  })

  const workCommentsResp = await client.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  if (workCommentsResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 作品と同じ年齢種別で新着順の作品一覧を取得
  const rating = workResp.data.work.rating

  const ratingText = rating ? toRatingText(rating) : "G"

  return json({
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
  })
}

export default function Work() {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <Suspense>
      <WorkContainer work={data.work} comments={data.workComments} />
    </Suspense>
  )
}

export const workCommentsQuery = graphql(
  `query WorkComments($workId: ID!) {
    work(id: $workId) {
      id
      comments(offset: 0, limit: 128) {
        ...Comment
      }
    }
  }`,
  [commentFragment],
)

export const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)
