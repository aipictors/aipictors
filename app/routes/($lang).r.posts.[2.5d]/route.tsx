import { loaderClient } from "~/lib/loader-client"
import {
  HomeTagList,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeWorkList,
  HomeWorkListItemFragment,
} from "~/routes/($lang)._main._index/components/home-work-list"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export async function loader() {
  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  const hotTagsResp = await loaderClient.query({
    query: hotTagsQuery,
    variables: {},
  })

  return {
    works: worksResp.data.works,
    hotTags: hotTagsResp.data.hotTags,
  }
}

export const meta: MetaFunction = (props) => {
  return createSensitiveMeta(META.SENSITIVE_HOME_2_5D, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SensitiveWorks25d () {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <HomeTagList hotTags={data.hotTags} />
      <HomeWorkList works={data.works} />
    </>
  )
}

export const hotTagsQuery = graphql(
  `query HotTags {
    hotTags {
      ...HomeTagListItem
      firstWork {
        ...HomeWorkListItem
      }
    }
  }`,
  [HomeTagListItemFragment, HomeWorkListItemFragment],
)

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWorkListItem
    }
  }`,
  [HomeWorkListItemFragment],
)
