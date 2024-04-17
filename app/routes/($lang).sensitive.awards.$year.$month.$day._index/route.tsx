import { RankingHeader } from "@/[lang]/(main)/awards/_components/ranking-header"
import { RankingWorkList } from "@/[lang]/(main)/awards/_components/ranking-work-list"
import { AppPage } from "@/_components/app/app-page"
import { workAwardsQuery } from "@/_graphql/queries/award/work-awards"
import { createClient } from "@/_lib/client"
import { ClientParamsError } from "@/errors/client-params-error"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"

export const loader = async (props: LoaderFunctionArgs) => {
  const client = createClient()

  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)

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
    workAwards: workAwardsResp.data.workAwards,
  }
}

export default function SensitiveAwardsPage() {
  const data = useLoaderData<typeof loader>()

  const params = useParams<"year" | "month" | "day">()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    throw new ClientParamsError()
  }

  const year = Number.parseInt(params.year)

  const month = Number.parseInt(params.month)

  const day = Number.parseInt(params.day)

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={day} />
      <RankingWorkList awards={data.workAwards} />
    </AppPage>
  )
}
