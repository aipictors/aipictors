import type { Metadata } from "next"

import type {
  WorkAwardsQuery,
  WorkAwardsQueryVariables,
} from "__generated__/apollo"
import { WorkAwardsDocument } from "__generated__/apollo"
import { MainRankingHeader } from "app/[lang]/(main)/awards/components/MainRankingHeader"
import { MainRankingWorkList } from "app/[lang]/(main)/awards/components/MainRankingWorkList"
import { createClient } from "app/client"
import { MainPage } from "app/components/MainPage"

type Props = {
  params: {
    year: string
    month: string
    day: string
  }
}

const AwardsPage = async (props: Props) => {
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
      <MainRankingHeader year={year} month={month} day={day} />
      <MainRankingWorkList awards={workAwardsQuery.data.workAwards} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
