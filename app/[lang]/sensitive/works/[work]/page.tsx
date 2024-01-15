import { WorkArticle } from "@/app/[lang]/(main)/works/[work]/_components/work-article"
import { WorkCommentList } from "@/app/[lang]/(main)/works/[work]/_components/work-comment-list"
import { WorkRelatedWorkList } from "@/app/[lang]/(main)/works/[work]/_components/work-related-work-list"
import { ArticlePage } from "@/app/_components/page/article-page"
import { createClient } from "@/app/_contexts/client"
import type {
  WorkCommentsQuery,
  WorkCommentsQueryVariables,
  WorkQuery,
  WorkQueryVariables,
} from "@/graphql/__generated__/graphql"
import { workQuery } from "@/graphql/queries/work/work"
import { workCommentsQuery } from "@/graphql/queries/work/work-comments"
import type { Metadata } from "next"

type Props = {
  params: { work: string }
}

const SensitiveWorkPage = async (props: Props) => {
  const client = createClient()

  const workResp = await client.query<WorkQuery, WorkQueryVariables>({
    query: workQuery,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsResp = await client.query<
    WorkCommentsQuery,
    WorkCommentsQueryVariables
  >({
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
      <WorkRelatedWorkList />
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

export const revalidate = 60

export default SensitiveWorkPage
