import { ParamsError } from "~/errors/params-error"
import { createClient } from "~/lib/client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import { WorkContainer } from "~/routes/($lang)._main.posts.$post._index/components/work-container"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"

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

  const newComments = await client.query({
    query: newCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  return json({
    post: props.params.post,
    work: workResp.data.work,
    workComments: workCommentsResp?.data?.work?.comments ?? [],
    newComments: newComments.data.newComments,
  })
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
      isDraft={true}
      work={data.work}
      comments={data.workComments}
      newComments={data.newComments}
      awardWorks={[]}
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
  [CommentListItemFragment],
)

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

const newCommentsQuery = graphql(
  `query NewComments {
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: false,
        ratings: [G],
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [HomeNewCommentsFragment],
)
