import type { Metadata } from "next"
import { WorksDocument, WorksQuery } from "__generated__/apollo"
import { client } from "app/client"
import { SectionLatestWorks } from "app/works/components/SectionLatestWorks"

const WorksPage = async () => {
  const resp = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return <SectionLatestWorks query={resp.data} />
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    robots: { index: false },
    title: "?",
  }
}

export const revalidate = 240

export default WorksPage
