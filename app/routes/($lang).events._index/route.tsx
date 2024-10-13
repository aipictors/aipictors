import { loaderClient } from "~/lib/loader-client"
import { type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import {
  AppEventItemFragment,
  AppEventCard,
} from "~/routes/($lang).events._index/components/app-event-card"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

export const meta: MetaFunction = () => {
  return createMeta(META.EVENTS)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const urlParams = new URLSearchParams(props.request.url.split("?")[1])

  const pageParam = urlParams.get("page")

  const page = pageParam ? Number(pageParam) : 0

  const resp = await loaderClient.query({
    query: appEventsQuery,
    variables: {
      offset: page * 16,
      limit: 16,
    },
  })

  return resp.data
}

export default function FollowingLayout() {
  const events = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (events === null) {
    return null
  }

  return (
    <>
      <h1 className="text-center font-bold text-2xl">
        {t("AIイラスト - 開催イベント一覧", "AI Illustration - Event List")}
      </h1>
      <div className="flex flex-col space-y-2">
        <div className="grid gap-2 rounded-lg md:grid-cols-2 xl:grid-cols-3">
          {events.appEvents.map((appEvent) => (
            <div key={appEvent.id}>
              <AppEventCard appEvent={appEvent} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const appEventsQuery = graphql(
  `query AppEvents( $limit: Int!, $offset: Int!, $where: AppEventsWhereInput) {
    appEvents(limit: $limit, offset: $offset, where: $where) {
      id
      ...AppEventItemFragment
    }
  }`,
  [AppEventItemFragment],
)
