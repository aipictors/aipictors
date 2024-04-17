import { WorkArticle } from "@/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/[lang]/(main)/works/[work]/_components/work-comment-list"
import { WorkRelatedList } from "@/[lang]/(main)/works/[work]/_components/work-related-list"
import { ArticlePage } from "@/_components/page/article-page"
import { workQuery } from "@/_graphql/queries/work/work"
import { workCommentsQuery } from "@/_graphql/queries/work/work-comments"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return []
}

export const loader = async (props: LoaderFunctionArgs) => {
  const client = createClient()

  if (props.params.work === undefined) {
    throw new Response("Invalid work", { status: 400 })
  }

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsResp = await client.query({
    query: workCommentsQuery,
    variables: {
      workId: props.params.work,
    },
  })

  if (workResp.data.work === null) {
    throw new Response("Not found", { status: 404 })
  }

  if (workCommentsResp.data.work === null) {
    throw new Response("Not found", { status: 404 })
  }

  return {
    work: workResp.data.work,
    workComments: workCommentsResp.data.work.comments,
  }
}

export default function SensitiveWorkPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <ArticlePage>
      <WorkArticle work={data.work} />
      <WorkCommentList comments={data.workComments} />
      <WorkRelatedList works={data.work.user.works} />
    </ArticlePage>
  )
}
