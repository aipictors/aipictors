import { Metadata } from "next"
import { RedirectType } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"
import { WorksQuery, WorksDocument } from "__generated__/apollo"
import { SectionLatestWorks } from "app/(main)/components/SectionLatestWorks"
import { client } from "app/client"
import { Config } from "config"

const HomePage = async () => {
  if (Config.isReleaseMode) {
    redirect(Config.currentWebSiteURL, RedirectType.replace)
  }

  const resp = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return <SectionLatestWorks query={resp.data} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
