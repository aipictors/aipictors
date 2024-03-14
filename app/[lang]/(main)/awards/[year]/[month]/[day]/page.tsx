import type { Metadata } from "next"

import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { RankingWorkList } from "@/app/[lang]/(main)/awards/_components/ranking-work-list"
import { AppPage } from "@/components/app/app-page"
import { workAwardsQuery } from "@/graphql/queries/award/work-awards"
import { createClient } from "@/lib/client"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

/**
 * ある日のランキングの履歴
 * @param props
 * @returns
 */
const DayAwardsPage = async (props: Props) => {
  const client = createClient()

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

  return (
    <AppPage>
      <RankingHeader year={year} month={month} day={day} />
      <RankingWorkList awards={workAwardsResp.data.workAwards} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default DayAwardsPage
