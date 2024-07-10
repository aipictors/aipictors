import { AppPage } from "@/_components/app/app-page"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { createClient } from "@/_lib/client"
import { RankingHeader } from "@/routes/($lang)._main.rankings._index/_components/ranking-header"
import { RankingWorkList } from "@/routes/($lang)._main.rankings._index/_components/ranking-work-list"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"

export async function loader(params: LoaderFunctionArgs) {
  const client = createClient()

  const year = params.params.year
    ? Number.parseInt(params.params.year)
    : new Date().getFullYear()
  const month = params.params.month
    ? Number.parseInt(params.params.month)
    : new Date().getMonth() + 1
  const day = params.params.day ? Number.parseInt(params.params.day) : null

  const variables = {
    offset: 0,
    limit: 200,
    where: {
      year: year,
      month: month,
      ...(day !== null && { day: day }),
      isSensitive: true,
    },
  }

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: variables,
  })

  return json({
    year,
    month,
    day,
    workAwards: workAwardsResp,
  })
}

export default function SensitiveAwards() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RankingHeader year={data.year} month={data.month} day={data.day} />
      <RankingWorkList awards={data.workAwards.data.workAwards} />
    </AppPage>
  )
}
