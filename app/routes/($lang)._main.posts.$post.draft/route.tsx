import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { CommentListItemFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-comment-list"
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useParams } from "react-router";
import { useLoaderData } from "react-router";
import { graphql } from "gql.tada"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { DraftWorkContainer } from "~/routes/($lang)._main.posts.$post.draft/components/draft-work-container"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  const workResp = await loaderClient.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
  })

  const workCommentsResp = await loaderClient.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  const newComments = await loaderClient.query({
    query: newCommentsQuery,
    variables: {
      workId: props.params.post,
    },
  })

  return {
    post: props.params.post,
    work: workResp.data.work,
    workComments: workCommentsResp?.data?.work?.comments ?? [],
    newComments: newComments.data.newComments,
  }
}

export const headers: HeadersFunction = () => ({
  // 下書き画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

export default function Work() {
  const params = useParams()

  if (params.post === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <DraftWorkContainer
      post={data.post}
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
