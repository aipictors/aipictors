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

const AwardsPage = async () => {
  const client = createClient()

  const year = new Date().getFullYear()

  const month = new Date().getMonth() + 1

  const day = new Date().getDate()

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
