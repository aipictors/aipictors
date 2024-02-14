import { RelatedModelList } from "@/app/[lang]/(main)/search/_components/related-model-list"
import { RelatedTagList } from "@/app/[lang]/(main)/search/_components/related-tag-list"
import { SearchHeader } from "@/app/[lang]/(main)/search/_components/search-header"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/components/app/app-page"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

const SearchPage = async () => {
  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  return (
    <AppPage>
      <RelatedTagList />
      <RelatedModelList />
      <SearchHeader />
      <WorkList works={worksResp.data.works ?? []} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SearchPage
