import { AppPage } from "~/components/app/app-page"
import { partialTagFieldsFragment } from "~/graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { HomeTagList } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeWorkList } from "~/routes/($lang)._main._index/components/home-work-list"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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

  return json({
    works: worksResp.data.works,
    hotTags: hotTagsResp.data.hotTags,
  })
}

export default function SensitiveWorks25d() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <HomeTagList hotTags={data.hotTags} />
      <HomeWorkList works={data.works} />
    </AppPage>
  )
}

export const hotTagsQuery = graphql(
  `query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialTagFieldsFragment, partialWorkFieldsFragment],
)

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
