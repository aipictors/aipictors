import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { RankingWorkList } from "@/[lang]/(main)/awards/_components/ranking-work-list"
import { AppPage } from "@/_components/app/app-page"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { createClient } from "@/_lib/client"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"

/**
 * ランキングの履歴
 * @returns
 */
export async function loader() {
  const client = createClient()

  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

  const workAwardsResp = await client.query({
    query: workAwardsQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        year: year,
        month: month,
        day: day,
      },
    },
  })
  return {
    year,
    month,
    day,
    workAwards: workAwardsResp,
  }
}

export default function Awards() {
  const params = useParams()

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  if (params.day === undefined) {
    return null
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RankingHeader year={data.year} month={data.month} day={data.day} />
      <RankingWorkList awards={data.workAwards.data.workAwards} />
    </AppPage>
  )
}
