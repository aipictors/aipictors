import type { Metadata } from "next"
import type { WorkQuery, WorkQueryVariables } from "__generated__/apollo"
import { WorkDocument } from "__generated__/apollo"
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

  if (workQuery.data.work === null) return null

  return (
    <MainPage>
      <WorkArticle work={workQuery.data.work} />
      <WorkCommentList work={workQuery.data.work} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorkPage
