import { loaderClient } from "~/lib/loader-client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import {
  WorkList,
  WorkListItemFragment,
} from "~/routes/($lang)._main.posts._index/components/work-list"
import { useLoaderData } from "react-router";
import { graphql } from "gql.tada"
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { ModelList } from "~/routes/($lang)._main.posts._index/components/model-list"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const tag = url.searchParams.get("tag")

  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: ["G"],
        orderBy: "LIKES_COUNT",
        ...(tag && { tagNames: [tag] }),
      },
    },
  })

  return {
    workResp: worksResp.data.works,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function Search() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  if (!data || !data.workResp || data.workResp.length === 0) {
    return null
  }

  return (
    <>
      <div className="m-auto md:max-w-96">
        <SearchHeader />
      </div>
      <h2 className="font-bold">{t("モデル一覧", "Model List")}</h2>
      <ModelList />
      <h2 className="font-bold">{t("人気作品", "Popular Works")}</h2>
      <WorkList works={data.workResp ?? []} />
    </>
  )
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.SEARCH, undefined, props.params.lang)
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...WorkListItem
    }
  }`,
  [WorkListItemFragment],
)
