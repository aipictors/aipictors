import type { WorksQuery } from "@/__generated__/apollo"
import { WorksDocument } from "@/__generated__/apollo"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

type Props = {
  params: {
    tag: string
  }
}

const TagPage = async (props: Props) => {
  const client = createClient()

  const worksQuery = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return (
    <AppPage>
      <WorkList works={worksQuery.data.works ?? []} />
    </AppPage>
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

export default TagPage
