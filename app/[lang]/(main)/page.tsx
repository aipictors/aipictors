import type { HotTagsQuery, WorksQuery } from "__generated__/apollo"
import { HotTagsDocument, WorksDocument } from "__generated__/apollo"
import { HomeTagList } from "app/[lang]/(main)/_components/HomeTagList"
import { HomeWorkList } from "app/[lang]/(main)/_components/HomeWorkList"
import { HomeWorkSection } from "app/[lang]/(main)/_components/HomeWorkSection"
import { HomeWorkSection2 } from "app/[lang]/(main)/_components/HomeWorkSection2"
import { MainPage } from "app/_components/page/MainPage"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

const HomePage = async () => {
  const client = createClient()

  // if (Config.isReleaseMode) {
  //   redirect(Config.currentWebSiteURL, RedirectType.replace)
  // }

  const worksQuery = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  const hotTagsQuery = await client.query<HotTagsQuery>({
    query: HotTagsDocument,
    variables: {},
  })

  return (
    <MainPage>
      <HomeTagList hotTagsQuery={hotTagsQuery.data} />
      <HomeWorkSection worksQuery={worksQuery.data} />
      <HomeWorkSection2 worksQuery={worksQuery.data} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
