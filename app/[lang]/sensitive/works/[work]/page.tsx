import { WorkArticle } from "@/app/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-list"
import WorkRelatedList from "@/app/[lang]/(main)/works/[work]/_components/work-related-list"
import { ArticlePage } from "@/app/_components/page/article-page"
import { workQuery } from "@/graphql/queries/work/work"
import { workCommentsQuery } from "@/graphql/queries/work/work-comments"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

type Props = {
  params: { work: string }
}

const SensitiveWorkPage = async (props: Props) => {
  const client = createClient()

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

  if (workResp.data.work === null) return null
  if (workCommentsResp.data.work === null) return null

  return (
    <ArticlePage>
      <WorkArticle work={workResp.data.work} />
      <WorkCommentList work={workCommentsResp.data.work} />
      <WorkRelatedList works={workResp.data.work.user.works} />
    </ArticlePage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export default SensitiveWorkPage
