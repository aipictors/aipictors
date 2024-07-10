import { AppPage } from "@/_components/app/app-page"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { createClient } from "@/_lib/client"
import { RankingHeader } from "@/routes/($lang)._main.rankings._index/_components/ranking-header"
import { RankingWorkList } from "@/routes/($lang)._main.rankings._index/_components/ranking-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year: year,
        month: month,
      },
    },
  })

  return json({
    year,
    month,
    workAwards: workAwardsResp,
  })
}

/**
 * ある月のランキングの履歴
 */
export default function MonthlyAwards() {
  const params = useParams()

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RankingHeader year={data.year} month={data.month} day={null} />
      <RankingWorkList awards={data.workAwards.data.workAwards} />
    </AppPage>
  )
}
