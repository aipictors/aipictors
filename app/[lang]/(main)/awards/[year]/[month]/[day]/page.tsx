import type { Metadata } from "next"

import type {
  WorkAwardsQuery,
  WorkAwardsQueryVariables,
} from "@/__generated__/apollo"
import { WorkAwardsDocument } from "@/__generated__/apollo"
import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { RankingWorkList } from "@/app/[lang]/(main)/awards/_components/ranking-work-list"
import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"

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

  const year = parseInt(props.params.year)

  const month = parseInt(props.params.month)

  const day = parseInt(props.params.day)

  const workAwardsQuery = await client.query<
    WorkAwardsQuery,
    WorkAwardsQueryVariables
  >({
    query: WorkAwardsDocument,
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
    <MainPage>
      <RankingHeader year={year} month={month} day={day} />
      <RankingWorkList awards={workAwardsQuery.data.workAwards} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default DayAwardsPage
