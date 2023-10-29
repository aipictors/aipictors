import type {
  WorkAwardsQuery,
  WorkAwardsQueryVariables,
} from "__generated__/apollo"
import { WorkAwardsDocument } from "__generated__/apollo"
import { RankingHeader } from "app/[lang]/(main)/awards/_components/RankingHeader"
import { RankingWorkList } from "app/[lang]/(main)/awards/_components/RankingWorkList"
import { MainPage } from "app/_components/MainPage"
import { createClient } from "app/_utils/client"
import type { Metadata } from "next"

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
