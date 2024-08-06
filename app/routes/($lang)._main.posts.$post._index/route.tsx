import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post/components/work-article"
import { commentFragment } from "~/routes/($lang)._main.posts.$post/components/work-comment-list"
import { WorkContainer } from "~/routes/($lang)._main.posts.$post/components/work-container"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { config } from "~/config"

export function HydrateFallback() {
  return <AppLoadingPage />
}

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

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 非公開の場合はエラー
  if (
    workResp.data.work.accessType === "PRIVATE" ||
    workResp.data.work.accessType === "DRAFT"
  ) {
    throw new Response(null, { status: 404 })
  }

  const workCommentsResp = await client.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  if (workCommentsResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  return json(
    {
      post: props.params.post,
      work: workResp.data.work,
      workComments: workCommentsResp.data.work.comments,
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.oneHour,
      },
    },
  )
}

export default function Work() {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <WorkContainer
      post={data.post}
      work={data.work}
      comments={data.workComments}
    />
  )
}

const workCommentsQuery = graphql(
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

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)
