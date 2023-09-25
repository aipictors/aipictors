import type { Metadata } from "next"
import type {
  WorkCommentsQuery,
  WorkCommentsQueryVariables,
  WorkQuery,
  WorkQueryVariables,
} from "__generated__/apollo"
import { WorkCommentsDocument, WorkDocument } from "__generated__/apollo"
import { WorkArticle } from "app/(main)/works/[work]/components/WorkArticle"
import { WorkCommentList } from "app/(main)/works/[work]/components/WorkCommentList"
import { client } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: { work: string }
}

const WorkPage: React.FC<Props> = async (props) => {
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
    <MainPage>
      <WorkArticle work={workQuery.data.work} />
      <WorkCommentList work={workCommentsQuery.data.work} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorkPage
