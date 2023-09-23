import type { Metadata } from "next"
import type { WorkQuery, WorkQueryVariables } from "__generated__/apollo"
import { WorkDocument } from "__generated__/apollo"
import { WorkDetail } from "app/(main)/works/[work]/components/WorkDetail"
import { client } from "app/client"

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

  return <WorkDetail workQuery={workQuery.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default WorkPage
