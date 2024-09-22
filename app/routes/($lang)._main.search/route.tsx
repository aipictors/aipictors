import { loaderClient } from "~/lib/loader-client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import {
  WorkList,
  WorkListItemFragment,
} from "~/routes/($lang)._main.posts._index/components/work-list"
import { json, redirect, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { ModelList } from "~/routes/($lang)._main.posts._index/components/model-list"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { useTranslation } from "~/hooks/use-translation"

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const url = new URL(props.request.url)

  const tag = url.searchParams.get("tag")

  if (tag) {
    return redirect(`/tags/${tag}`, {
      status: 302,
    })
  }

  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: ["G"],
        orderBy: "LIKES_COUNT",
      },
    },
  })

  return json({
    worksResp,
  })
}

export default function Search() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  return (
    <>
      <h1 className="font-bold">{t("作品を検索", "Search Works")}</h1>
      <div className="m-auto md:max-w-96">
        <SearchHeader />
      </div>
      <h2 className="font-bold">{t("モデル一覧", "Model List")}</h2>
      <ModelList />
      <h2 className="font-bold">{t("人気作品", "Popular Works")}</h2>
      <WorkList works={data.worksResp.data.works ?? []} />
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
