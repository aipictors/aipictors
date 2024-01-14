import type {
  WorkAwardsQuery,
  WorkAwardsQueryVariables,
} from "@/__generated__/apollo"
import { WorkAwardsDocument } from "@/__generated__/apollo"
import { RankingHeader } from "@/app/[lang]/(main)/awards/_components/ranking-header"
import { RankingWorkList } from "@/app/[lang]/(main)/awards/_components/ranking-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
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
    <AppPage>
      <RankingHeader year={year} month={month} day={day} />
      <RankingWorkList awards={workAwardsQuery.data.workAwards} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default AwardsPage
