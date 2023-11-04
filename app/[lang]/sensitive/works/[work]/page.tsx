import type {
  WorkCommentsQuery,
  WorkCommentsQueryVariables,
  WorkQuery,
  WorkQueryVariables,
} from "__generated__/apollo"
import { WorkCommentsDocument, WorkDocument } from "__generated__/apollo"
import { WorkArticle } from "app/[lang]/(main)/works/[work]/_components/WorkArticle"
import { WorkCommentList } from "app/[lang]/(main)/works/[work]/_components/WorkCommentList"
import { WorkRelatedWorkList } from "app/[lang]/(main)/works/[work]/_components/WorkRelatedWorkList"
import { ArticlePage } from "app/_components/pages/ArticlePage"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

type Props = {
  params: { work: string }
}

const WorkPage: React.FC<Props> = async (props) => {
  const client = createClient()

  const workQuery = await client.query<WorkQuery, WorkQueryVariables>({
    query: WorkDocument,
    variables: {
      id: props.params.work,
    },
  })

  const workCommentsQuery = await client.query<
    WorkCommentsQuery,
    WorkCommentsQueryVariables
  >({
    query: WorkCommentsDocument,
    variables: {
      workId: props.params.work,
    },
  })

  if (workQuery.data.work === null) return null
  if (workCommentsQuery.data.work === null) return null

  return (
    <ArticlePage>
      <WorkArticle work={workQuery.data.work} />
      <WorkCommentList work={workCommentsQuery.data.work} />
      <WorkRelatedWorkList />
    </ArticlePage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorkPage
