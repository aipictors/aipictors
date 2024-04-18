import { WorkList } from "@/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/_components/app/app-page"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { RelatedModelList } from "@/routes/($lang)._main.search/_components/related-model-list"
import { RelatedTagList } from "@/routes/($lang)._main.search/_components/related-tag-list"
import { SearchHeader } from "@/routes/($lang)._main.search/_components/search-header"
import { useLoaderData } from "@remix-run/react"

export async function loader() {
  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })
  return {
    worksResp,
  }
}

export default function Search() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RelatedTagList />
      <RelatedModelList />
      <SearchHeader />
      <WorkList works={data.worksResp.data.works ?? []} />
    </AppPage>
  )
}
