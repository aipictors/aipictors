import type {
  WorkAwardsQuery,
  WorkAwardsQueryVariables,
} from "__generated__/apollo"
import { WorkAwardsDocument } from "__generated__/apollo"
import { RankingHeader } from "app/[lang]/(main)/awards/_components/RankingHeader"
import { RankingWorkList } from "app/[lang]/(main)/awards/_components/RankingWorkList"
import { MainPage } from "app/_components/page/MainPage"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

/**
 * ランキングの履歴
 * @returns
 */
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

export default AwardsPage
