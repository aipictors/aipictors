import { HomeTagList } from "@/[lang]/(main)/_components/home-tag-list"
import { HomeWorkList } from "@/[lang]/(main)/_components/home-work-list"
import { AppPage } from "@/_components/app/app-page"
import { hotTagsQuery } from "@/_graphql/queries/tag/hot-tags"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
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

  const hotTagsResp = await client.query({
    query: hotTagsQuery,
    variables: {},
  })

  return {
    works: worksResp.data.works,
    hotTags: hotTagsResp.data.hotTags,
  }
}

export default function SensitiveWorks3d() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <HomeTagList hotTags={data.hotTags} />
      <HomeWorkList works={data.works} />
    </AppPage>
  )
}
