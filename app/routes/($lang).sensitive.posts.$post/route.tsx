import { ArticlePage } from "~/components/page/article-page"
import { createClient } from "~/lib/client"
import {
  WorkArticle,
  workArticleFragment,
} from "~/routes/($lang)._main.posts.$post/components/work-article"
import {
  CommentFragment,
  WorkCommentList,
} from "~/routes/($lang)._main.posts.$post/components/work-comment-list"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export const meta: MetaFunction = () => {
  return []
}

export async function loader(props: LoaderFunctionArgs) {
  const client = createClient()

  if (props.params.post === undefined) {
    throw new Response("Invalid work", { status: 400 })
  }

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
  })

  if (workResp.data.work === null) {
    throw new Response("Not found", { status: 404 })
  }

  const workCommentsResp = await client.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  if (workCommentsResp.data.work === null) {
    throw new Response("Not found", { status: 404 })
  }

  return json({
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
  })
}

export default function SensitiveWorkPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <ArticlePage>
      <WorkArticle work={data.work} />
      {data.work?.isCommentsEditable && (
        <WorkCommentList workId={data.work.id} comments={data.workComments} />
      )}
    </ArticlePage>
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
  [CommentFragment],
)

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)
